import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router';
import { DoctorContext } from '../context/DoctorContext';

const Navbar = ({ toggleSidebar }) => {
  const { atoken, setatoken, getAdminProfile, adminProfile } = useContext(AdminContext);
  const { dtoken, setdtoken, getProfileData, profileData } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (dtoken) {
      getProfileData();
    }
    if (atoken) {
      getAdminProfile();
    }
  }, [dtoken, atoken]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.dropdown-container')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const logout = () => {
    navigate('/');
    if (dtoken) {
      setdtoken('');
      localStorage.removeItem('dtoken');
    }
    if (atoken) {
      setatoken('');
      localStorage.removeItem('atoken');
    }
  };

  const handleImageClick = () => {
    if (atoken) {
      navigate('/admin-dashboard');
    } else if (dtoken) {
      navigate('/doctor-dashboard');
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-10 py-3 transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-lg shadow-lg'
        : 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100'
        }`}
      style={{ animation: 'slideDown 0.5s ease-out' }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center pl-10.5 pr-10.5 rounded-lg hover:bg-green-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <img
          onClick={handleImageClick}
          className="w-32 sm:w-36 cursor-pointer transition-transform duration-300 hover:scale-105 flex-shrink-0"
          style={{ minWidth: '128px' }}
          src="https://i.ibb.co/R2Y4vBk/Screenshot-2024-11-23-000108-removebg-preview.png"
          alt="Dashboard Logo"
        />

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold shadow-md animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          {atoken ? 'Admin Panel' : 'Doctor Panel'}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center dropdown-container">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-green-100 hover:shadow-lg transition-all duration-200 hover:border-green-200"
          >
            <img
              src={
                dtoken
                  ? (profileData?.image || 'https://via.placeholder.com/40')
                  : (adminProfile?.image || 'https://via.placeholder.com/40')
              }
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-green-100"
            />
            <span className="text-sm font-medium text-gray-700">
              {dtoken ? (profileData?.name || 'Doctor') : (adminProfile?.name || 'Admin')}
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden transition-all duration-200 ease-out ${isMounted ? (menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none') : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            style={{
              transformOrigin: 'top right',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.98)'
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                handleImageClick();
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150 flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">{atoken ? 'Admin Dashboard' : 'Doctor Dashboard'}</span>
            </button>

            <div className="border-t border-gray-200" />

            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors duration-150 flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .dropdown-container {
          z-index: 50;
        }
        
        .dropdown-container > div {
          min-width: 192px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(229, 231, 235, 0.8);
        }
        
        .dropdown-container button:hover {
          transform: translateX(2px);
        }
        
        .dropdown-container button {
          transition: all 0.15s ease;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
