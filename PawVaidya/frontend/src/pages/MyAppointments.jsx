import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios'
import { toast } from 'react-toastify'
import AnimalHealthChatbot from '../components/AnimalHealthChatbot';
import AppointmentChat from '../components/AppointmentChat';
import ReportModal from '../components/ReportModal';
import RunningDogLoader from '../components/RunningDogLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, CheckCircle, XCircle, MessageCircle, Stethoscope, AlertCircle, Sparkles, Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateSpeciality } from '../utils/translateSpeciality';

const MyAppointments = () => {
  const { backendurl, token, userdata } = useContext(AppContext)
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedChat, setSelectedChat] = useState(null)
  const [reportAppointment, setReportAppointment] = useState(null)


  // Debug log
  console.log('MyAppointments - userdata:', userdata)

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  // Parse appointment date and time
  const parseAppointmentDateTime = (slotDate, slotTime) => {
    const [day, month, year] = slotDate.split('_');
    const [time, period] = slotTime.split(' ');
    let [hours, minutes] = time.split(':');

    // Convert to 24-hour format
    if (period === 'PM' && hours !== '12') {
      hours = String(Number(hours) + 12);
    }
    if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    return new Date(year, month - 1, day, hours, minutes);
  }

  // Getting User Appointments Data Using API
  const getUserAppointments = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(backendurl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        // Check and auto-cancel expired appointments
        const processedAppointments = data.appointments.map(appointment => {
          const appointmentDateTime = parseAppointmentDateTime(appointment.slotDate, appointment.slotTime);
          if (appointmentDateTime < currentTime && !appointment.cancelled && !appointment.isCompleted) {
            // Automatically cancel the appointment
            cancelAppointment(appointment._id);
            return { ...appointment, cancelled: true };
          }
          return appointment;
        });

        setAppointments(processedAppointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Timer to check appointment status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  // Trigger appointment check when token or current time changes
  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token, currentTime])

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendurl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        toast.error(`Appointment automatically cancelled due to time expiration.`)
        getUserAppointments()
      } else {
        toast.error(data.message)
        console.log(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Calculate time remaining or time passed
  const getAppointmentStatus = (slotDate, slotTime) => {
    const appointmentDateTime = parseAppointmentDateTime(slotDate, slotTime);
    const timeDiff = appointmentDateTime.getTime() - currentTime.getTime();

    if (timeDiff > 0) {
      // Appointment is in the future
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      return `Starts in ${hours}h ${minutes}m`;
    } else {
      // Appointment is in the past
      const hours = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60)));
      const minutes = Math.abs(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)));
      return `Expired ${hours}h ${minutes}m ago`;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RunningDogLoader />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f2e4c7] from-amber-50 via-orange-50 to-rose-50 pb-20'>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className='relative overflow-hidden bg-gradient-to-r from-[#5A4035] via-[#7a5a48] to-[#5A4035] py-12 px-6 mb-8 rounded-b-[3rem] shadow-2xl'
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-10 -right-10 w-60 h-60 bg-amber-300 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold text-white'>
              My Appointments
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className='text-amber-100 text-lg flex items-center gap-2'
          >
            <Sparkles className="w-5 h-5" />
            Manage your pet care appointments
          </motion.p>
        </div>
      </motion.div>

      {/* Empty State */}
      {appointments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center py-20"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Calendar className="w-24 h-24 text-[#5A4035] opacity-50" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No Appointments Yet</h3>
          <p className="text-gray-500">Book your first appointment to see it here</p>
        </motion.div>
      )}

      {/* Appointments Grid */}
      <div className='max-w-7xl mx-auto px-4 md:px-6 space-y-6'>
        <AnimatePresence>
          {appointments.map((item, index) => (
            <motion.div
              key={item._id || index}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 }
              }}
              className='group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100'
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6 z-10">
                {item.cancelled ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 border-2 border-red-300 rounded-full shadow-lg"
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-bold text-red-600">Cancelled</span>
                  </motion.div>
                ) : item.isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-green-300 rounded-full shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-600">Completed</span>
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-full shadow-lg"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-600">Upcoming</span>
                  </motion.div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5A4035]/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className='relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-6'>
                {/* Doctor Image */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className='relative flex-shrink-0'
                >
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#5A4035] to-amber-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                    <img
                      className='relative w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white'
                      src={item.docData.image}
                      alt={item.docData.name}
                    />
                    <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border-2 border-[#5A4035]">
                      <Stethoscope className="w-5 h-5 text-[#5A4035]" />
                    </div>
                  </div>
                </motion.div>

                {/* Appointment Details */}
                <div className='flex-1 space-y-4'>
                  {/* Doctor Name & Speciality */}
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className='text-2xl font-bold text-gray-800 flex items-center gap-2'
                    >
                      Dr. {item.docData.name}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className='text-[#5A4035] font-semibold mt-1 flex items-center gap-2'
                    >
                      <Sparkles className="w-4 h-4" />
                      {translateSpeciality(item.docData.speciality, t)}
                    </motion.p>
                  </div>

                  {/* Info Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {/* Date & Time */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      className='flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100'
                    >
                      <Calendar className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                      <div>
                        <p className='text-xs font-semibold text-blue-900 uppercase tracking-wide'>Date & Time</p>
                        <p className='text-sm font-bold text-gray-800'>{slotDateFormat(item.slotDate)}</p>
                        <p className='text-sm text-gray-600'>{item.slotTime}</p>
                      </div>
                    </motion.div>

                    {/* Status Timer */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      className='flex items-start gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100'
                    >
                      <AlertCircle className='w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0' />
                      <div>
                        <p className='text-xs font-semibold text-amber-900 uppercase tracking-wide'>Status</p>
                        <p className='text-sm font-bold text-gray-800'>{getAppointmentStatus(item.slotDate, item.slotTime)}</p>
                      </div>
                    </motion.div>

                    {/* Phone */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      className='flex items-start gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100'
                    >
                      <Phone className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
                      <div>
                        <p className='text-xs font-semibold text-green-900 uppercase tracking-wide'>Contact</p>
                        <p className='text-sm font-bold text-gray-800'>+91 {item.docData.docphone}</p>
                      </div>
                    </motion.div>

                    {/* Location */}
                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      className='flex items-start gap-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100'
                    >
                      <MapPin className='w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0' />
                      <div>
                        <p className='text-xs font-semibold text-purple-900 uppercase tracking-wide'>Location</p>
                        <p className='text-sm font-bold text-gray-800'>{item.docData.address.Location}</p>
                        <p className='text-xs text-gray-600'>{item.docData.address.line}</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Full Address */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className='p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200'
                  >
                    <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'>Full Address</p>
                    <p className='text-sm text-gray-700 leading-relaxed'>{item.docData.full_address}</p>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className='flex flex-wrap gap-3 pt-2'>
                    {!item.cancelled && !item.isCompleted && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-[#5A4035] to-[#7a5a48] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Pay Online
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedChat(item)}
                          className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Chat with Doctor
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            let whatsappNumber = item.docData.docphone.replace(/\s+/g, '');
                            if (!whatsappNumber.startsWith('+91')) {
                              whatsappNumber = `+91${whatsappNumber}`;
                            }
                            const whatsappURL = `https://wa.me/${whatsappNumber}?text=Hi%20Doctor%20${item.docData.name},%20I%20would%20like%20to%20confirm%20my%20appointment.%0A%0AHere%20are%20the%20details:%0A-%20Appointment%20ID:%20${item._id}%0A-%20Date:%20${slotDateFormat(item.slotDate)}%0A-%20Time:%20${item.slotTime}%0A-%20Pet%20Name:%20${item.userData.breed}%0A-%20Email:%20${item.userData.email}%0A-%20Phone:%20+91%20${item.docData.docphone}%0A-%20Amount:%20${item.amount}`;
                            window.open(whatsappURL, '_blank');
                          }}
                          className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          WhatsApp
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setReportAppointment(item)}
                          className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Flag className="w-5 h-5" />
                          Report Doctor
                        </motion.button>



                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => cancelAppointment(item._id)}
                          className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Cancel
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#5A4035]/5 to-transparent rounded-tl-full" />
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-br-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Chatbot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative mt-12"
      >
        <AnimalHealthChatbot />
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {selectedChat && (
          <AppointmentChat
            appointment={selectedChat}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>

      {/* Report Modal */}
      {reportAppointment && (
        <ReportModal
          appointment={reportAppointment}
          onClose={() => setReportAppointment(null)}
        />
      )}


    </div>
  )
}

export default MyAppointments
