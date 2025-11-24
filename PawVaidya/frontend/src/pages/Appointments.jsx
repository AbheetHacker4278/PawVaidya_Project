import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import assets from '../assets/assets_frontend/assets';
import ReleatedDoctors from '../components/ReleatedDoctors';
import { AppContext } from '../context/AppContext';
import { translateSpeciality } from '../utils/translateSpeciality';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Stethoscope, Calendar, CheckCircle, Clock, ArrowRight, X, Loader, MapPin, Award, IndianRupee, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Appointments = () => {
  const { t } = useTranslation();
  const { docId } = useParams();
  const { doctors, backendurl, token, getdoctorsdata, userdata } = useContext(AppContext);
  const daysofWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [hasActiveAppointment, setHasActiveAppointment] = useState(false);
  const [activeAppointmentInfo, setActiveAppointmentInfo] = useState(null);
  const [loadingActiveAppointment, setLoadingActiveAppointment] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showUnbanRequestModal, setShowUnbanRequestModal] = useState(false);
  const [unbanRequestMessage, setUnbanRequestMessage] = useState('');
  const [hasUnbanRequest, setHasUnbanRequest] = useState(false);
  const [unbanRequestStatus, setUnbanRequestStatus] = useState('');
  const [unbanAttempts, setUnbanAttempts] = useState(0);
  const [doctorSchedules, setDoctorSchedules] = useState([]);

  const loadingMessages = [
    "Checking Available Slots...",
    "We are confirming Your Booking...",
    "Booking is Confirmed!",
    // New messages for cancellation
    "Processing Cancellation Request...",
    "Updating Appointment Records...",
    "Appointment Successfully Cancelled!"
  ];

  const LoadingState = ({ step }) => {
    const icons = [
      <Stethoscope className="w-12 h-12 text-primary animate-pulse" />,
      <Calendar className="w-12 h-12 text-primary animate-bounce" />,
      <CheckCircle className="w-12 h-12 text-green-500 animate-ping" />
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-yellow-100 p-8 rounded-lg max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              {icons[step]}
            </div>
            <div className="relative w-64 h-2 bg-gray-200 rounded-full mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(step + 1) * 33.33}%` }}
              />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              {loadingMessages[step]}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const CancellationLoadingState = ({ step }) => {
    const icons = [
      <X className="w-12 h-12 text-red-500 animate-pulse" />,
      <Calendar className="w-12 h-12 text-red-500 animate-bounce" />,
      <CheckCircle className="w-12 h-12 text-green-500 animate-ping" />
    ];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              {icons[step]}
            </div>
            <div className="relative w-64 h-2 bg-gray-200 rounded-full mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${(step + 1) * 33.33}%` }}
              />
            </div>
            <p className="text-lg font-medium text-gray-800 text-center">
              {loadingMessages[step + 3]}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const ActiveAppointmentLoadingState = () => {
    return (
      <div className="mt-4 p-6 bg-gray-100 border border-gray-200 rounded-lg animate-pulse">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 text-primary animate-spin" />
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          <div className="h-3 bg-gray-300 rounded w-4/6"></div>
        </div>
        <div className="mt-4 flex gap-3">
          <div className="h-10 bg-gray-300 rounded w-40"></div>
          <div className="h-10 bg-gray-300 rounded w-40"></div>
        </div>
      </div>
    );
  };

  // Check if user has any active appointments and ban status
  const checkActiveAppointments = async () => {
    if (!token) return;

    setLoadingActiveAppointment(true);
    try {
      // Check user profile for ban status
      const profileRes = await axios.get(backendurl + '/api/user/get-profile', { headers: { token } });
      
      if (profileRes.data.success && profileRes.data.userdata) {
        // Check if user data has ban information
        const userData = profileRes.data.userdata;
        if (userData.isBanned) {
          setIsBanned(true);
          setBanReason(userData.banReason || 'Policy Violation');
          setUnbanAttempts(userData.unbanRequestAttempts || 0);
          
          // Check if user has an unban request
          const unbanReqRes = await axios.get(backendurl + `/api/unban-request/my-request/${userData.id}`);
          if (unbanReqRes.data.success && unbanReqRes.data.hasRequest) {
            setHasUnbanRequest(true);
            setUnbanRequestStatus(unbanReqRes.data.request.status);
          }
        } else {
          setIsBanned(false);
          setBanReason('');
        }
      }

      const { data } = await axios.get(backendurl + '/api/user/appointments', { headers: { token } });

      if (data.success) {
        // Check if there are any active appointments (not cancelled and not completed)
        const activeAppointments = data.appointments.filter(
          appointment => !appointment.cancelled && !appointment.isCompleted
        );

        if (activeAppointments.length > 0) {
          setHasActiveAppointment(true);
          setActiveAppointmentInfo(activeAppointments[0]);
        } else {
          setHasActiveAppointment(false);
          setActiveAppointmentInfo(null);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingActiveAppointment(false);
    }
  };

  const submitUnbanRequest = async () => {
    if (!unbanRequestMessage.trim()) {
      toast.warn('Please provide a reason for your unban request');
      return;
    }

    try {
      const { data } = await axios.post(
        backendurl + '/api/unban-request/submit',
        {
          requesterType: 'user',
          requesterId: userdata.id,
          requestMessage: unbanRequestMessage
        }
      );

      if (data.success) {
        toast.success(data.message);
        setShowUnbanRequestModal(false);
        setUnbanRequestMessage('');
        setHasUnbanRequest(true);
        setUnbanRequestStatus('pending');
        setUnbanAttempts(prev => prev + 1); // Increment attempts
        // Refresh user data to get updated attempts count
        checkActiveAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error submitting unban request:', error);
      toast.error('Failed to submit unban request');
    }
  };

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(docInfo);
  };

  // Fetch doctor's schedule
  const fetchDoctorSchedule = async () => {
    try {
      const { data } = await axios.get(backendurl + `/api/doctor-schedule/public/${docId}`);
      if (data.success) {
        setDoctorSchedules(data.schedules);
      }
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
    }
  };

  const getAvailableSlots = () => {
    // If user has an active appointment, don't show any slots
    if (hasActiveAppointment) {
      setDocSlots([]);
      return;
    }

    setDocSlots([]);
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const dayName = daysOfWeek[currentDate.getDay()];
      
      // Find schedule for this day
      const daySchedule = doctorSchedules.find(schedule => schedule.dayOfWeek === dayName && schedule.isActive);
      
      let timeSlots = [];

      // If doctor has a schedule for this day, use it
      if (daySchedule) {
        const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
        
        let slotDate = new Date(currentDate);
        slotDate.setHours(startHour, startMin, 0, 0);
        
        let endTime = new Date(currentDate);
        endTime.setHours(endHour, endMin, 0, 0);

        // For today, skip past slots
        if (i === 0) {
          const now = new Date();
          if (slotDate < now) {
            slotDate = new Date(now);
            // Round up to next slot
            const minutesToAdd = daySchedule.slotDuration - (slotDate.getMinutes() % daySchedule.slotDuration);
            slotDate.setMinutes(slotDate.getMinutes() + minutesToAdd);
            slotDate.setSeconds(0, 0);
          }
        }

        // Generate slots based on schedule
        while (slotDate < endTime) {
          let formattedTime = slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          let day = currentDate.getDate();
          let month = currentDate.getMonth() + 1;
          let year = currentDate.getFullYear();

          const slotDateStr = day + "_" + month + "_" + year;
          const slotTime = formattedTime;

          const isSlotAvailable = docInfo.slots_booked[slotDateStr] && docInfo.slots_booked[slotDateStr].includes(slotTime) ? false : true;

          if (isSlotAvailable) {
            timeSlots.push({
              datetime: new Date(slotDate),
              time: formattedTime
            });
          }

          slotDate.setMinutes(slotDate.getMinutes() + daySchedule.slotDuration);
        }
      } else {
        // Fallback to default slots if no schedule is set (10 AM - 9 PM, 30 min slots)
        let endTime = new Date(currentDate);
        endTime.setHours(21, 0, 0, 0);

        if (i === 0) {
          const now = new Date();
          const startHour = now.getMinutes() > 30 ? now.getHours() + 1 : now.getHours();
          const startMinutes = now.getMinutes() > 30 ? 0 : 30;

          currentDate.setHours(startHour);
          currentDate.setMinutes(startMinutes);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        while (currentDate < endTime) {
          let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          let day = currentDate.getDate();
          let month = currentDate.getMonth() + 1;
          let year = currentDate.getFullYear();

          const slotDate = day + "_" + month + "_" + year;
          const slotTime = formattedTime;

          const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

          if (isSlotAvailable) {
            timeSlots.push({
              datetime: new Date(currentDate),
              time: formattedTime
            });
          }

          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }
      }

      setDocSlots(prev => ([...prev, timeSlots]));
    }
  };

  const validateBooking = () => {
    if (hasActiveAppointment) {
      setValidationError('You already have an active appointment. Please complete or cancel it before booking a new one.');
      toast.warn('You already have an active appointment. Please complete or cancel it before booking a new one.');
      return false;
    }

    if (!docSlots[slotIndex]?.[0]?.datetime) {
      setValidationError('Please select an appointment date');
      toast.warn('Please select an appointment date');
      return false;
    }
    if (!slotTime) {
      setValidationError('Please select an appointment time');
      toast.warn('Please select an appointment time');
      return false;
    }
    setValidationError('');
    return true;
  };

  const bookappointment = async () => {
    if (!token) {
      toast.warn('Login to Book Appointment');
      return navigate('/login');
    }
    if (!userdata.isAccountverified) {
      toast.warn('Please Verify Your Account');
      return navigate('/');
    }

    if (!validateBooking()) {
      return;
    }

    setIsLoading(true);
    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + '_' + month + '_' + year;

      setLoadingStep(0);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLoadingStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data } = await axios.post(
        backendurl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      setLoadingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (data.success) {
        toast.success(data.message);
        getdoctorsdata();
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      // Check if it's a ban error (403 status)
      if (error.response?.status === 403) {
        toast.error(error.response.data.message, {
          position: 'top-center',
          autoClose: 5000,
          style: {
            background: '#fee2e2',
            color: '#991b1b',
            fontWeight: 'bold',
            fontSize: '16px'
          }
        });
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const cancelAppointment = async () => {
    if (!activeAppointmentInfo) return;

    setIsLoading(true);
    try {
      // Set first cancellation loading step
      setLoadingStep(0);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Set second cancellation loading step
      setLoadingStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data } = await axios.post(
        backendurl + '/api/user/cancel-appointment',
        { appointmentId: activeAppointmentInfo._id },
        { headers: { token } }
      );

      // Set final cancellation loading step
      setLoadingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (data.success) {
        toast.success('Appointment cancelled successfully');
        setHasActiveAppointment(false);
        setActiveAppointmentInfo(null);
        getdoctorsdata();
        // Refresh available slots after cancellation
        getAvailableSlots();
      } else {
        toast.error(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Error cancelling appointment');
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  useEffect(() => {
    fetchDocInfo();
    checkActiveAppointments();
    if (docId) {
      fetchDoctorSchedule();
    }
  }, [doctors, docId, token]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo, hasActiveAppointment, doctorSchedules]);

  useEffect(() => {
    setValidationError('');
  }, [slotIndex, slotTime]);

  if (isLoading) {
    if (activeAppointmentInfo) {
      return <CancellationLoadingState step={loadingStep} />;
    } else {
      return <LoadingState step={loadingStep} />;
    }
  }

  return docInfo && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      {/* Doctor Info Section */}
      <div className="flex flex-col sm:flex-row gap-6 max-w-7xl mx-auto px-4">
        {/* Doctor Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group"
        >
          <div className="relative overflow-hidden rounded-3xl shadow-2xl w-full sm:max-w-sm">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-transparent to-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            
            {/* Image */}
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="w-full h-auto object-cover"
              src={docInfo.image}
              alt={docInfo.name}
            />
            
            {/* Decorative corner */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/20 to-transparent rounded-tl-full" />
          </div>
        </motion.div>

        {/* Doctor Details Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 relative"
        >
          <div className="bg-gradient-to-br from-[#5A4035] via-[#6b4d3f] to-[#5A4035] rounded-3xl p-8 shadow-2xl border border-white/10 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/10 to-transparent rounded-tr-full" />
            
            <div className="relative z-10">
              {/* Doctor Name & Verification */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3 mb-4"
              >
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    {docInfo.name}
                    <motion.img
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      className="w-7 h-7"
                      src={assets.verified_icon}
                      alt="Verified"
                    />
                  </h1>
                </div>
              </motion.div>

              {/* Degree & Speciality */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="flex items-center gap-2 text-slate-100">
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-base md:text-lg font-medium">{docInfo.degree} - {translateSpeciality(docInfo.speciality, t)}</span>
                </div>
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg"
                >
                  {docInfo.experience}
                </motion.span>
              </motion.div>

              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">About</h3>
                </div>
                <p className="text-slate-200 leading-relaxed">{docInfo.about}</p>
              </motion.div>

              {/* Treatment Fee */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <IndianRupee className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-300">Approx Treatment Fee</p>
                    <p className="text-2xl font-bold text-white">₹{docInfo.fees || 'N/A'}</p>
                  </div>
                </div>
              </motion.div>

              {/* Location Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                {docInfo.address?.Location && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400/20 to-green-600/20 backdrop-blur-md rounded-full border border-green-400/30 text-white font-medium shadow-lg"
                  >
                    <MapPin className="w-4 h-4" />
                    {docInfo.address.Location}
                  </motion.div>
                )}
                {docInfo.address?.line && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400/20 to-blue-600/20 backdrop-blur-md rounded-full border border-blue-400/30 text-white font-medium shadow-lg"
                  >
                    {docInfo.address.line}
                  </motion.div>
                )}
              </motion.div>

              {/* Full Address */}
              {docInfo.full_address && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  className="px-5 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <p className="text-slate-100 leading-relaxed">{docInfo.full_address}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Booking Slots Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-7xl mx-auto px-4 mt-12"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="text-3xl font-bold bg-gradient-to-r from-[#5A4035] to-[#7a5a48] bg-clip-text text-transparent mb-6 flex items-center gap-3"
          >
            <Calendar className="w-8 h-8 text-[#5A4035]" />
            Booking Slots
          </motion.h2>

          {loadingActiveAppointment ? (
            <ActiveAppointmentLoadingState />
          ) : hasActiveAppointment ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Calendar className="w-7 h-7 text-yellow-600 mr-3" />
                </motion.div>
                <p className="text-yellow-900 font-bold text-xl">Active Appointment</p>
              </div>
              <p className="text-yellow-700 mb-4">You already have an active appointment. Please complete or cancel it before booking a new one.</p>
              
              {activeAppointmentInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-5 rounded-xl shadow-md mb-4"
                >
                  <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Appointment Details
                  </p>
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <Stethoscope className="w-5 h-5 text-[#5A4035]" />
                      <span><strong>Doctor:</strong> {activeAppointmentInfo.docData.name}</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <Calendar className="w-5 h-5 text-[#5A4035]" />
                      <span><strong>Date:</strong> {activeAppointmentInfo.slotDate?.split('_').join(' / ')}</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <Clock className="w-5 h-5 text-[#5A4035]" />
                      <span><strong>Time:</strong> {activeAppointmentInfo.slotTime}</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/my-appointments')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 group"
                >
                  <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  View My Appointments
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelAppointment}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Cancel Appointment
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                {/* Ban Overlay */}
                {isBanned && (
                  <div className="absolute inset-0 z-50 bg-red-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center p-6 max-w-lg w-full"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        className="mb-4"
                      >
                        <X className="w-16 h-16 text-white mx-auto" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Account Banned
                      </h3>
                      <p className="text-lg text-red-100 mb-2 font-semibold">
                        You have been banned for false report of {docInfo.name}
                      </p>
                      <p className="text-base text-red-200 mb-4">
                        Reason: {banReason || 'Policy Violation'}
                      </p>
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 mb-4">
                        <p className="text-white text-xs leading-relaxed">
                          You cannot book appointments while your account is banned.
                        </p>
                      </div>
                      
                      {/* Unban Request Button */}
                      {unbanAttempts >= 3 ? (
                        <div className="w-full px-4 py-3 bg-red-500/20 border border-red-400 text-red-100 font-semibold rounded-lg text-center">
                          <p className="text-sm">Maximum attempts reached (3/3)</p>
                          <p className="text-xs mt-1">Please contact support directly</p>
                        </div>
                      ) : hasUnbanRequest && unbanRequestStatus === 'pending' ? (
                        <div className="space-y-2">
                          <div className="w-full px-4 py-3 bg-yellow-500/20 border border-yellow-400 text-yellow-100 font-semibold rounded-lg flex items-center justify-center gap-2">
                            <Clock className="w-5 h-5" />
                            Request Pending
                          </div>
                          <p className="text-xs text-white/70 text-center">
                            Attempts: {unbanAttempts}/3
                          </p>
                        </div>
                      ) : hasUnbanRequest && unbanRequestStatus === 'approved' ? (
                        <div className="space-y-2">
                          <div className="w-full px-4 py-3 bg-green-500/20 border border-green-400 text-green-100 font-semibold rounded-lg flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Request Approved
                          </div>
                          <p className="text-xs text-white/70 text-center">
                            Your account will be unbanned shortly
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hasUnbanRequest && unbanRequestStatus === 'denied' && (
                            <div className="w-full px-4 py-3 bg-red-500/20 border border-red-400 text-red-100 font-semibold rounded-lg flex items-center justify-center gap-2 mb-2">
                              <Clock className="w-5 h-5" />
                              Previous Request Denied
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowUnbanRequestModal(true)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            {hasUnbanRequest && unbanRequestStatus === 'denied' ? 'Request Again' : 'Request Unban'}
                          </motion.button>
                          <p className="text-xs text-white/70 text-center">
                            Attempts: {unbanAttempts}/3
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Unban Request Modal */}
                {showUnbanRequestModal && (
                  <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">Request Unban</h3>
                        <button
                          onClick={() => setShowUnbanRequestModal(false)}
                          className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                          <X className="w-6 h-6 text-gray-600" />
                        </button>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Please explain why you believe your ban should be lifted. Admin will review your request.
                      </p>
                      
                      <textarea
                        value={unbanRequestMessage}
                        onChange={(e) => setUnbanRequestMessage(e.target.value)}
                        placeholder="Enter your reason here..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        rows="5"
                      />
                      
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setShowUnbanRequestModal(false)}
                          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitUnbanRequest}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
                        >
                          Submit Request
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Date Selection */}
                <div className="mb-8">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg font-semibold text-gray-700 mb-4"
                  >
                    Select Date
                  </motion.p>
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {docSlots.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ y: -8, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSlotIndex(index)}
                        className={`min-w-[90px] text-center py-6 px-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                          slotIndex === index
                            ? 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-xl scale-105'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-red-300 text-gray-700'
                        }`}
                      >
                        <motion.p
                          className="text-sm font-medium mb-1"
                          animate={slotIndex === index ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {item[0]?.datetime ? daysofWeek[item[0].datetime.getDay()] : 'N/A'}
                        </motion.p>
                        <motion.p
                          className="text-2xl font-bold"
                          animate={slotIndex === index ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          {item[0]?.datetime ? item[0].datetime.getDate() : 'N/A'}
                        </motion.p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="mb-8">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-lg font-semibold text-gray-700 mb-4"
                  >
                    Select Time Slot
                  </motion.p>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {docSlots.length &&
                        docSlots[slotIndex]
                          ?.filter((item) => item)
                          .map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: 0.05 * index }}
                              whileHover={{ scale: 1.1, y: -5 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSlotTime(item.time)}
                              className={`px-6 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-300 ${
                                item.time === slotTime
                                  ? 'bg-gradient-to-r from-[#5A4035] to-[#7a5a48] text-white shadow-xl scale-105'
                                  : 'bg-white border-2 border-[#5A4035] text-[#5A4035] hover:bg-[#5A4035] hover:text-white hover:shadow-lg'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {item.time.toLowerCase()}
                              </div>
                            </motion.div>
                          ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Book Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.button
                    whileHover={slotTime && docSlots[slotIndex]?.[0]?.datetime ? {
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
                    } : {}}
                    whileTap={slotTime && docSlots[slotIndex]?.[0]?.datetime ? { scale: 0.98 } : {}}
                    onClick={bookappointment}
                    disabled={!slotTime || !docSlots[slotIndex]?.[0]?.datetime}
                    className={`px-12 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-300 ${
                      !slotTime || !docSlots[slotIndex]?.[0]?.datetime
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl hover:shadow-green-500/50'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6" />
                    Book Appointment
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>

                  <AnimatePresence>
                    {validationError && (
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="text-red-500 font-medium mt-3 flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        {validationError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Related Doctors */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <ReleatedDoctors
          docId={docId}
          speciality={docInfo.speciality}
          location={docInfo.address.Location}
          State={docInfo.address.line}
        />
      </motion.div>
    </motion.div>
  );
};

export default Appointments;