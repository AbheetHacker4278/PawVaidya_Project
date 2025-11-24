// import React, { useContext, useEffect } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentChat from '../../components/AppointmentChat';
import ReportUserModal from '../../components/ReportUserModal';
import { MessageCircle, Flag } from 'lucide-react';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const { dtoken, appointments, getAppointments, getProfileData, profileData } = useContext(DoctorContext);
  
  const { slotDateFormat, calculateAge } = useContext(AppContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [reportUser, setReportUser] = useState(null);
  const [petNoteAppt, setPetNoteAppt] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [visitNote, setVisitNote] = useState('');
  const [selectedReport, setSelectedReport] = useState('');

  const parseAppointmentDateTime = (slotDate, slotTime) => {
    const [day, month, year] = slotDate.split('_');
    const [time, period] = slotTime.split(' ');
    let [hours, minutes] = time.split(':');

    if (period === 'PM' && hours !== '12') {
      hours = String(Number(hours) + 12);
    }
    if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    return new Date(year, month - 1, day, hours, minutes);
  };

  useEffect(() => {
    if (dtoken) {
      getAppointments();
      getProfileData();
    }
  }, [dtoken]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400
      }
    }
  };

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto mt-8 p-6 bg-gradient-to-b from-green-50 to-blue-50 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1 
          className="flex text-3xl font-bold text-green-600 text-center"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          🦥 All Appointments . . .
        </motion.h1>
      </motion.header>

      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {appointments.reverse().map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.1 }}
            >
            <motion.div 
              className="flex items-center gap-4"
              variants={itemVariants}
            >
              <motion.div 
                className="flex-shrink-0 w-16 h-16"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.img
                  src={item.userData.image}
                  alt="Pet Owner"
                  className="w-full h-full rounded-full object-cover border-2 border-green-300 shadow-md"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    borderColor: "#4ade80"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.h2 
                  className="text-lg font-semibold text-gray-800"
                  whileHover={{ color: "#059669" }}
                >
                  {item.userData.name}
                </motion.h2>
                <motion.p className="text-sm text-gray-500">{calculateAge(item.userData.dob)} years old</motion.p>
                <motion.p className="text-sm text-gray-500">+91 {item.userData.phone}</motion.p>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex-1 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-center md:text-left"
              variants={itemVariants}
            >
              <motion.div 
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm font-medium text-gray-500">Date & Time</span>
                <motion.span 
                  className="text-md font-semibold text-gray-800"
                  whileHover={{ color: "#059669" }}
                >
                  {slotDateFormat(item.slotDate)}, {item.slotTime}
                </motion.span>
              </motion.div>

              <motion.div 
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm font-medium text-gray-500">Payment</span>
                <motion.span 
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${item.payment ? 'bg-green-100 text-green-600' : 'bg-green-400 text-white'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: item.payment ? "#bbf7d0" : "#4ade80"
                  }}
                >
                  {item.payment ? 'Online' : 'Cash'}
                </motion.span>
              </motion.div>

              <motion.div 
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm font-medium text-gray-500">Fees</span>
                <motion.span 
                  className="text-md font-semibold text-gray-800"
                  whileHover={{ color: "#059669" }}
                >
                  ₹{item.amount}
                </motion.span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm font-medium text-gray-500">Pet Type</span>
                <motion.span 
                  className="text-md font-semibold text-gray-700"
                  whileHover={{ color: "#059669" }}
                >
                  {item.userData.category}
                </motion.span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm font-medium text-gray-500">Pet Age</span>
                <motion.span 
                  className="text-md font-semibold text-gray-700"
                  whileHover={{ color: "#059669" }}
                >
                  {item.userData.pet_age}
                </motion.span>
              </motion.div>

              <motion.div 
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm font-medium text-gray-500">Status</span>
                <motion.span 
                  className={`text-sm font-semibold ${item.cancelled ? 'text-red-500' : item.isCompleted ? 'text-green-500' : 'text-blue-500'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  whileHover={{ 
                    scale: 1.1,
                    color: item.cancelled ? "#ef4444" : item.isCompleted ? "#22c55e" : "#3b82f6"
                  }}
                >
                  {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending...'}
                </motion.span>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex flex-col gap-2 items-end"
              variants={itemVariants}
            >
              <div className="flex gap-2">
                {!item.cancelled && !item.isCompleted && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedChat(item)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </motion.button>
                )}
                
                {(item.isCompleted || item.cancelled) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setReportUser(item)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                    title="Report User"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </motion.button>
                )}
              </div>
              <motion.div 
                className="text-xl font-bold text-gray-500"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500,
                  delay: index * 0.1 + 0.3
                }}
                whileHover={{ 
                  scale: 1.2,
                  color: "#059669",
                  rotate: 5
                }}
              >
                #{index + 1}
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
        </AnimatePresence>
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

      {/* Report User Modal */}
      <AnimatePresence>
        {reportUser && (
          <ReportUserModal 
            appointment={reportUser} 
            onClose={() => setReportUser(null)} 
          />
        )}
      </AnimatePresence>

      
    </motion.div>
  );
};

export default DoctorAppointments;
