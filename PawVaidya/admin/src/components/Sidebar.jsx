import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { NavLink } from 'react-router-dom';
import assets from '../assets/assets_admin/assets';
import { DoctorContext } from '../context/DoctorContext';

const Sidebar = ({ isOpen }) => {
  const { atoken } = useContext(AdminContext);
  const { dtoken } = useContext(DoctorContext);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 bg-gradient-to-b from-white to-green-50/30 border-r border-green-100 shadow-xl z-40 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-20'
          }`}
        style={{
          height: 'calc(100vh - 64px)',
          animation: isOpen ? 'slideInLeft 0.3s ease-out' : ''
        }}
      >
        {/* Sidebar Items */}
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
          {atoken && (
            <ul className="py-4 space-y-1">
              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/admin-dashboard'}
              >
                <img src={assets.home_icon} alt="" className="w-6 h-6 flex-shrink-0" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Dashboard</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/all-appointments'}
              >
                <img src={assets.appointment_icon} alt="" className="w-6 h-6 flex-shrink-0" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Appointments</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/add-doctor'}
              >
                <img src={assets.add_icon} alt="" className="w-6 h-6 flex-shrink-0" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Add Doctor</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-list'}
              >
                <img src={assets.people_icon} alt="" className="w-6 h-6 flex-shrink-0" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Doctor List</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/total-users'}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Total Users</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/admin-messages'}
              >
                <img className='w-6 h-6 flex-shrink-0' src="https://cdn-icons-png.flaticon.com/512/893/893257.png" alt="" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Messages</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/all-reports'}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>All Reports</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/unban-requests'}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Unban Requests</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/trash'}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Trash</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/admin-profile'}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Admin Profile</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-chat'}
              >
                <img className='w-6 h-6 flex-shrink-0' src={assets.people_icon} alt="" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Doctor Chat</p>
              </NavLink>
            </ul>
          )}

          {dtoken && (
            <ul className="py-4 space-y-1">
              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-dashboard'}
              >
                <img src={assets.home_icon} alt="" className="w-6 h-6 flex-shrink-0" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Dashboard</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-appointments'}
              >
                <img src={assets.appointment_icon} alt="" className="w-6 h-6 flex-shrink-0" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Appointments</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-profile'}
              >
                <img src={assets.people_icon} alt="" className="w-6 h-6 flex-shrink-0" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Profile</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-schedule'}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>My Schedule</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-blogs'}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>My Blogs</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/doctor-messages'}
              >
                <img className='w-6 h-6 flex-shrink-0' src="https://cdn-icons-png.flaticon.com/512/893/893257.png" alt="" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Messages</p>
              </NavLink>

              <NavLink
                className={({ isActive }) => `group flex items-center ${isOpen ? 'gap-4 px-4' : 'lg:justify-center lg:px-2'} py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' : 'hover:bg-green-50 lg:hover:translate-x-0'}`}
                to={'/admin-chat'}
              >
                <img className='w-6 h-6 flex-shrink-0' src={assets.people_icon} alt="" />
                <p className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>Admin Chat</p>
              </NavLink>
            </ul>
          )}
        </div>

        <style jsx>{`
          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
