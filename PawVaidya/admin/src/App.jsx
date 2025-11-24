import React, { useContext, useState } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorSchedule from './pages/Doctor/DoctorSchedule';
import DoctorBlogs from './pages/Doctor/DoctorBlogs';
import TotalUsers from './pages/Admin/TotalUsers';
import AdminMessages from './pages/Admin/AdminMessages';
import DoctorMessages from './components/DoctorMessages';
import AllReports from './pages/Admin/AllReports';
import UnbanRequests from './pages/Admin/UnbanRequests';
import TrashReports from './pages/Admin/TrashReports';
// import AdminProfile from './pages/Admin/AdminProfile';
import AdminProfile from './pages/Admin/AdminProfile';
import GlobalReminderNotifications from './components/GlobalReminderNotifications';
import DoctorChat from './pages/Admin/DoctorChat';
import AdminChat from './pages/Doctor/AdminChat';

const App = () => {
  const { atoken } = useContext(AdminContext)
  const { dtoken } = useContext(DoctorContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return atoken || dtoken ? (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50/30'>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Main Content Area with padding for fixed navbar */}
      <div className='pt-16'>
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <main className={`min-h-screen overflow-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
          }`}>
          <div className='animate-fadeIn'>
            <Routes>
              <Route path='/' element={<></>} />
              <Route path='/admin-dashboard' element={<Dashboard />} />
              <Route path='/all-appointments' element={<AllAppointments />} />
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/doctor-list' element={<DoctorsList />} />
              <Route path='/total-users' element={<TotalUsers />} />
              <Route path='/admin-messages' element={<AdminMessages />} />
              <Route path='/all-reports' element={<AllReports />} />
              <Route path='/unban-requests' element={<UnbanRequests />} />
              <Route path='/trash' element={<TrashReports />} />
              <Route path='/admin-profile' element={<AdminProfile />} />

              <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor-appointments' element={<DoctorAppointments />} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
              <Route path='/doctor-schedule' element={<DoctorSchedule />} />
              <Route path='/doctor-blogs' element={<DoctorBlogs />} />
              <Route path='/doctor-messages' element={<DoctorMessages />} />
              <Route path='/doctor-chat' element={<DoctorChat />} />
              <Route path='/admin-chat' element={<AdminChat />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Global Reminder Notifications - Only for doctors */}
      {dtoken && <GlobalReminderNotifications />}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App