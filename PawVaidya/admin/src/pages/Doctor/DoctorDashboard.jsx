import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import assets from '../../assets/assets_admin/assets';
import { AppContext } from '../../context/AppContext';
import { DoctorContext } from '../../context/DoctorContext';
import DoctorCalendar from '../../components/DoctorCalendar';

const DoctorDashboard = () => {
  const { dtoken, dashdata, getdashdata, cancelAppointment, completeAppointment, getDoctorReminders } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);
  
  // State for daily earnings and reminders
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [activeNotifications, setActiveNotifications] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 8
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const listItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  // State for search input and filtered appointments
  const [searchInput, setSearchInput] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredCancelledAppointments, setFilteredCancelledAppointments] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState([]);

  useEffect(() => {
    if (dtoken) {
      getdashdata();
    }
  }, [dtoken]);

  useEffect(() => {
    if (dashdata) {
      // Filter logic based on search input
      const searchFilter = (appointments) => 
        appointments.filter((item) =>
          item.userData.name.toLowerCase().includes(searchInput.toLowerCase())
        );

      setFilteredAppointments(searchFilter(dashdata.latestAppointments));
      setFilteredCancelledAppointments(searchFilter(dashdata.latestCancelled));

      // Calculate today's earnings
      const today = new Date();
      const todayString = `${today.getDate().toString().padStart(2, '0')}_${(today.getMonth() + 1).toString().padStart(2, '0')}_${today.getFullYear()}`;
      
      const todayCompletedAppointments = dashdata.latestAppointments.filter(appointment => 
        appointment.isCompleted && 
        !appointment.cancelled && 
        appointment.slotDate === todayString
      );
      
      setTodayEarnings(todayCompletedAppointments);

      // Calculate weekly earnings (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6); // Include today, so 6 days ago + today = 7 days
      
      const weeklyCompletedAppointments = dashdata.latestAppointments.filter(appointment => {
        if (!appointment.isCompleted || appointment.cancelled) return false;
        
        const [day, month, year] = appointment.slotDate.split('_');
        const appointmentDate = new Date(year, month - 1, day);
        
        return appointmentDate >= weekAgo && appointmentDate <= today;
      });
      
      setWeeklyEarnings(weeklyCompletedAppointments);
    }
  }, [searchInput, dashdata]);

  return dashdata && (
    <motion.div 
      className='m-5'
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Statistics Section */}
      <motion.div 
        className='flex flex-wrap gap-3'
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className='flex items-center gap-2 bg-white p-4 min-w-52 rounded-lg border-2 border-gray-100 cursor-pointer shadow-sm hover:shadow-lg'
          variants={cardVariants}
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <motion.img 
            className='w-8' 
            src='https://i.ibb.co/BZtjVJp/images-removebg-preview.png' 
            alt="" 
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div>
            <motion.p 
              className='text-xl font-semibold text-gray-600'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              ₹{dashdata.earnings}
            </motion.p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </motion.div>
        
        <motion.div 
          className='flex items-center gap-2 bg-white p-4 min-w-52 rounded-lg border-2 border-gray-100 cursor-pointer shadow-sm hover:shadow-lg'
          variants={cardVariants}
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <motion.img 
            className='w-14' 
            src="https://thumbs.dreamstime.com/b/appointment-calendar-date-icon-green-vector-sketch-well-organized-simple-use-commercial-purposes-web-printing-any-type-243330702.jpg" 
            alt="" 
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div>
            <motion.p 
              className='text-xl font-semibold text-gray-600'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {dashdata.appointments}
            </motion.p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </motion.div>
        
        <motion.div 
          className='flex items-center gap-2 bg-white p-4 min-w-52 rounded-lg border-2 border-gray-100 cursor-pointer shadow-sm hover:shadow-lg'
          variants={cardVariants}
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <motion.img 
            className='w-8' 
            src="https://cdn0.iconfinder.com/data/icons/green-eco-icons/115/eco_pet-01-512.png" 
            alt="" 
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div>
            <motion.p 
              className='text-xl font-semibold text-gray-600'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {dashdata.patients}
            </motion.p>
            <p className='text-gray-400'>Pets Info</p>
          </div>
        </motion.div>
        
        <motion.div 
          className='flex items-center gap-2 bg-white p-4 min-w-52 rounded-lg border-2 border-gray-100 cursor-pointer shadow-sm hover:shadow-lg'
          variants={cardVariants}
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <motion.img 
            className='w-8' 
            src="https://cdn-icons-png.flaticon.com/512/4685/4685242.png" 
            alt="" 
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div>
            <motion.p 
              className='text-xl font-semibold text-gray-600'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {dashdata.completedAppointmentCount}
            </motion.p>
            <p className='text-gray-400'>Completed Appointments</p>
          </div>
        </motion.div>
        
        <motion.div 
          className='flex items-center gap-2 bg-white p-4 min-w-52 rounded-lg border-2 border-gray-100 cursor-pointer shadow-sm hover:shadow-lg'
          variants={cardVariants}
          whileHover="hover"
          transition={{ duration: 0.2 }}
        >
          <motion.img 
            className='w-8' 
            src="https://e7.pngegg.com/pngimages/914/745/png-clipart-cross-on-a-red-circle-red-cross-on-red-fork-thumbnail.png" 
            alt="" 
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div>
            <motion.p 
              className='text-xl font-semibold text-gray-600'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {dashdata.canceledAppointmentCount}
            </motion.p>
            <p className='text-gray-400'>Canceled Appointments</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className='mt-6'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <motion.input 
          type="text" 
          className='w-auto px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-200 transition-all duration-300'
          placeholder="Search by patient name..." 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)}
          whileFocus={{ 
            scale: 1.02, 
            boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)",
            borderColor: "#22c55e"
          }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </motion.div>

      {/* Bookings and Cancelled Appointments Section */}
      <motion.div 
        className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-10'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        {/* Latest Bookings */}
        <motion.div 
          className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300'
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className='flex items-center gap-2.5 px-4 py-4 rounded-t border bg-gradient-to-r from-green-50 to-green-100'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.img 
              src={assets.list_icon} 
              alt="" 
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className='font-semibold text-green-800'>Latest Bookings 🦥</p>
          </motion.div>
          <div className='pt-6 border border-t-0'>
            <AnimatePresence>
              {filteredAppointments.slice(0, 5).map((item, index) => (
                <motion.div 
                  className='flex items-center px-6 py-3 gap-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0'
                  key={index}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    backgroundColor: "#f9fafb",
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.img 
                    className='rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm'
                    src={item.userData.image} 
                    alt="" 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <div className='flex-1 text-sm'>
                    <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                    <p className='text-gray-600 '>Booking on {slotDateFormat(item.slotDate)}</p>
                  </div>
                  {item.cancelled
                    ? <motion.p 
                        className='text-red-400 text-xs font-medium'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        Cancelled
                      </motion.p>
                    : item.isCompleted
                      ? <motion.p 
                          className='text-green-500 text-xs font-medium'
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          Completed
                        </motion.p>
                      : <motion.div 
                          className='flex'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.img 
                            onClick={() => cancelAppointment(item._id)} 
                            className='w-10 cursor-pointer' 
                            src={assets.cancel_icon} 
                            alt="" 
                            whileHover={{ scale: 1.2, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          />
                          <motion.img 
                            onClick={() => completeAppointment(item._id)} 
                            className='w-10 cursor-pointer' 
                            src={assets.tick_icon} 
                            alt="" 
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          />
                        </motion.div>
                  }
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Latest Cancelled */}
        <motion.div 
          className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300'
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className='flex items-center gap-2.5 px-4 py-4 rounded-t border bg-gradient-to-r from-red-50 to-red-100'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.img 
              src={assets.list_icon} 
              alt="" 
              animate={{ rotate: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className='font-semibold text-red-800'>Latest Cancelled 🦥</p>
          </motion.div>
          <div className='pt-4 border border-t-0'>
            <AnimatePresence>
              {filteredCancelledAppointments.slice(0, 5).map((item, index) => (
                <motion.div 
                  className='flex items-center px-6 py-3 gap-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0'
                  key={index}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  whileHover={{ 
                    backgroundColor: "#fef2f2",
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.img 
                    className='rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm'
                    src={item.userData.image} 
                    alt="" 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <div className='flex-1 text-sm'>
                    <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                    <p className='text-gray-600 '>Booking on {slotDateFormat(item.slotDate)}</p>
                  </div>
                  <motion.p 
                    className='text-red-400 text-xs font-medium'
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    Cancelled
                  </motion.p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Daily Earnings */}
        <motion.div 
          className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300'
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className='flex items-center gap-2.5 px-4 py-4 rounded-t border bg-gradient-to-r from-blue-50 to-blue-100'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <motion.img 
              src={assets.list_icon} 
              alt="" 
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className='font-semibold text-blue-800'>Today's Earnings 💰</p>
          </motion.div>
          <div className='pt-4 border border-t-0'>
            <AnimatePresence>
              {todayEarnings.length > 0 ? (
                todayEarnings.slice(0, 5).map((item, index) => (
                  <motion.div 
                    className='flex items-center px-6 py-3 gap-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0'
                    key={index}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    whileHover={{ 
                      backgroundColor: "#f0f9ff",
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.img 
                      className='rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm'
                      src={item.userData.image} 
                      alt="" 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <div className='flex-1 text-sm'>
                      <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                      <p className='text-gray-600'>Earned on {slotDateFormat(item.slotDate)}</p>
                    </div>
                    <motion.p 
                      className='text-green-600 text-sm font-bold'
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      ₹{item.amount}
                    </motion.p>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className='flex items-center justify-center px-6 py-8 text-gray-500'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className='text-center'>
                    <motion.div 
                      className='text-4xl mb-2'
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      💰
                    </motion.div>
                    <p className='text-sm font-medium'>No earnings today yet</p>
                    <p className='text-xs text-gray-400'>Complete appointments to see earnings</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Total Today's Earnings */}
            {todayEarnings.length > 0 && (
              <motion.div 
                className='px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-t'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-semibold text-gray-700'>Total Today:</span>
                  <motion.span 
                    className='text-lg font-bold text-green-600'
                    whileHover={{ scale: 1.1 }}
                  >
                    ₹{todayEarnings.reduce((total, item) => total + (item.amount || 0), 0)}
                  </motion.span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Weekly Earnings */}
        <motion.div 
          className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300'
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className='flex items-center gap-2.5 px-4 py-4 rounded-t border bg-gradient-to-r from-purple-50 to-purple-100'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
          >
            <motion.img 
              src={assets.list_icon} 
              alt="" 
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className='font-semibold text-purple-800'>Weekly Earnings 📊</p>
          </motion.div>
          <div className='pt-4 border border-t-0'>
            <AnimatePresence>
              {weeklyEarnings.length > 0 ? (
                weeklyEarnings.slice(0, 5).map((item, index) => (
                  <motion.div 
                    className='flex items-center px-6 py-3 gap-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0'
                    key={index}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ 
                      backgroundColor: "#faf5ff",
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.img 
                      className='rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm'
                      src={item.userData.image} 
                      alt="" 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <div className='flex-1 text-sm'>
                      <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                      <p className='text-gray-600'>Earned on {slotDateFormat(item.slotDate)}</p>
                    </div>
                    <motion.p 
                      className='text-purple-600 text-sm font-bold'
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      ₹{item.amount}
                    </motion.p>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className='flex items-center justify-center px-6 py-8 text-gray-500'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className='text-center'>
                    <motion.div 
                      className='text-4xl mb-2'
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      📊
                    </motion.div>
                    <p className='text-sm font-medium'>No earnings this week yet</p>
                    <p className='text-xs text-gray-400'>Complete appointments to see weekly earnings</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Total Weekly Earnings */}
            {weeklyEarnings.length > 0 && (
              <motion.div 
                className='px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-semibold text-gray-700'>Total This Week:</span>
                  <motion.span 
                    className='text-lg font-bold text-purple-600'
                    whileHover={{ scale: 1.1 }}
                  >
                    ₹{weeklyEarnings.reduce((total, item) => total + (item.amount || 0), 0)}
                  </motion.span>
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  Last 7 days • {weeklyEarnings.length} appointment{weeklyEarnings.length !== 1 ? 's' : ''}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Calendar Section */}
      <motion.div 
        className='mt-10'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
      >
        <DoctorCalendar />
      </motion.div>
    </motion.div>
  );
}

export default DoctorDashboard;
