import React, { useContext, useEffect, useState, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import assets from '../assets/assets_frontend/assets';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import LanguageSwitcher from './LanguageSwitcher';
import LocationRefreshButton from './LocationRefreshButton';
import { MapPin } from 'lucide-react';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, settoken, userdata, backendurl, setuserdata, setisLoggedin, unreadMessages, userLocation, refreshUserLocation } = useContext(AppContext)
  const [showMenu, setShowMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])


  const Logout = async () => {
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(
        backendurl + '/api/user/logout',
        {},
        { headers: { token } }
      )
      data.success && setisLoggedin(false)
      data.success && setuserdata(false)
      data.success && settoken(false)
      data.success && localStorage.removeItem('token')
      navigate('/')
    } catch (error) {
      toast.error(error.message);
    }
  }

  const sendVerificationOtp = async () => {
    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/send-verify-otp`,
        {},
        {
          headers: { token }, // Include headers properly
        }
      );

      if (data.success) {
        navigate('/email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between text-sm py-4 mb-5 border-b px-4 sm:px-[10%] transition-all duration-500 ease-in-out ${isScrolled
        ? 'bg-white/80 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border-white/20'
        : 'bg-[#F2E4C6] border-[#9ACD32]'
      }`} style={{
        animation: 'slideDown 0.5s ease-out',
        backdropFilter: isScrolled ? 'blur(3px) saturate(180%)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none'
      }}>
      <img onClick={() => navigate('/')} className="w-44 cursor-pointer" src="https://i.ibb.co/R2Y4vBk/Screenshot-2024-11-23-000108-removebg-preview.png" alt='' />
      <ul className='hidden md:flex items-start gap-5 font-medium text-[#1B3726]'>
        <NavLink to='/'>
          <li className="py-1 px-3  transition-all duration-300 rounded">{t('navbar.home')}</li>
          <hr className="border-none outline-none h-0.5 bg-[#5A4035] w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to='/doctors'>
          <li className="py-1 px-3  transition-all duration-300 rounded">{t('navbar.allDoctors')}</li>
          <hr className="border-none outline-none h-0.5 bg-[#5A4035] w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to='/about'>
          <li className="py-1 px-3  transition-all duration-300 rounded">{t('navbar.about')}</li>
          <hr className="border-none outline-none h-0.5 bg-[#5A4035] w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to='/contact'>
          <li className="py-1 px-3  transition-all duration-300 rounded">{t('navbar.contact')}</li>
          <hr className="border-none outline-none h-0.5 bg-[#5A4035] w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to='/community-blogs'>
          <li className="py-1 px-3  transition-all duration-300 rounded">{t('navbar.communityBlogs')}</li>
          <hr className="border-none outline-none h-0.5 bg-[#5A4035] w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink>
          {userdata && !userdata.isAccountverified && (
            <p
              onClick={sendVerificationOtp}
              className="hover:text-white hover:bg-red-700  cursor-pointer text-red-500 border border-red-500 p-1 rounded-full"
            >
              {t('navbar.verifyEmail')}
            </p>
          )}
        </NavLink>

      </ul>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        {token && userdata && (
          <div className="relative cursor-pointer" onClick={() => navigate('/messages')}>
            <svg className="w-6 h-6 text-[#1B3726]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadMessages > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold notification-badge">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </div>
        )}
        {token && userdata ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-200 ease-out transform hover:scale-105 ${isDropdownOpen
                  ? 'bg-white shadow-lg border border-white'
                  : 'bg-white/50 hover:bg-white/80 border border-white/30 hover:border-white/50 backdrop-blur-sm'
                }`}
            >
              <img
                className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                src={userdata.image}
                alt="Profile"
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700">{userdata.name}</span>
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Modern Dropdown Menu */}
            <div className={`absolute right-0 top-full mt-3 w-64 origin-top-right transition-all duration-200 ease-out ${isDropdownOpen
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
              {/* Arrow indicator */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative">
                {/* User Info Header */}
                <div className="px-4 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src={userdata.image}
                      alt="Profile"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{userdata.name}</p>
                      <p className="text-xs text-gray-500">{userdata.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => { navigate('/my-profile'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">{t('navbar.myProfile')}</span>
                  </button>

                  <button
                    onClick={() => { navigate('/my-appointments'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2M6 7v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">{t('navbar.myAppointments')}</span>
                  </button>

                  <button
                    onClick={() => { navigate('/messages'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    {unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold notification-badge">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </button>
                </div>

                {/* Location Section */}
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Location</span>
                      </div>
                      <LocationRefreshButton
                        variant="icon"
                        size="sm"
                        onLocationUpdate={refreshUserLocation}
                        location={userLocation}
                      />
                    </div>
                    {userLocation && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <button
                    onClick={() => { Logout(); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-150 group"
                  >
                    <svg className="w-5 h-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">{t('navbar.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#1B3726] text-white font-medium px-6 py-2 rounded-full hidden md:block hover:bg-[#2d4d3d] transition-colors"
            >
              {t('navbar.createAccount')}
            </button>
            <button
              onClick={() => navigate('/login-form')}
              className="bg-[#1B3726] text-white font-medium px-6 py-2 rounded-full hover:bg-[#2d4d3d] transition-colors"
            >
              {t('navbar.login')}
            </button>
          </>
        )}
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />
        {/* Mobile Menu Update */}
        <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${showMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMenu(false)}></div>

          {/* Menu Content */}
          <div className={`absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl transition-transform duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className='flex items-center justify-between px-5 py-6 border-b'>
              <img onClick={() => { navigate('/'); setShowMenu(false) }} className='w-36 cursor-pointer' src="https://i.ibb.co/R2Y4vBk/Screenshot-2024-11-23-000108-removebg-preview.png" alt="" />
              <img className='w-7 cursor-pointer' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="" />
            </div>
            <ul className='flex flex-col gap-2 p-4 text-base font-medium'>
              <NavLink onClick={() => setShowMenu(false)} to='/'>
                <li className='px-4 py-3 rounded hover:bg-gray-100 transition-colors'>{t('navbar.home')}</li>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
                <li className='px-4 py-3 rounded hover:bg-gray-100 transition-colors'>{t('navbar.allDoctors')}</li>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/about'>
                <li className='px-4 py-3 rounded hover:bg-gray-100 transition-colors'>{t('navbar.about')}</li>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/contact'>
                <li className='px-4 py-3 rounded hover:bg-gray-100 transition-colors'>{t('navbar.contact')}</li>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/community-blogs'>
                <li className='px-4 py-3 rounded hover:bg-gray-100 transition-colors'>{t('navbar.communityBlogs')}</li>
              </NavLink>
              {token && userdata && (
                <NavLink onClick={() => setShowMenu(false)} to='/messages'>
                  <li className='px-4 py-3 rounded hover:bg-gray-100 transition-colors flex items-center justify-between'>
                    <span>Notifications</span>
                    {unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </li>
                </NavLink>
              )}
              {userdata && !userdata.isAccountverified && (
                <li className='px-4 py-3'>
                  <p
                    onClick={() => { sendVerificationOtp(); setShowMenu(false); }}
                    className="cursor-pointer text-red-500 border border-red-500 p-2 rounded-full text-center hover:bg-red-50 transition-colors"
                  >
                    {t('navbar.verifyEmail')}
                  </p>
                </li>
              )}
              {!token && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <button
                      onClick={() => { navigate('/login'); setShowMenu(false); }}
                      className="w-full bg-[#1B3726] text-white font-medium px-4 py-3 rounded-full hover:bg-[#2d4d3d] transition-colors mb-3"
                    >
                      {t('navbar.createAccount')}
                    </button>
                    <button
                      onClick={() => { navigate('/login-form'); setShowMenu(false); }}
                      className="w-full border border-[#1B3726] text-[#1B3726] font-medium px-4 py-3 rounded-full hover:bg-[#1B3726] hover:text-white transition-colors"
                    >
                      {t('navbar.login')}
                    </button>
                  </div>
                </>
              )}
              {token && userdata && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2 px-4">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <MapPin className="w-4 h-4" />
                      Location
                    </span>
                    <LocationRefreshButton
                      variant="icon"
                      size="sm"
                      onLocationUpdate={refreshUserLocation}
                      location={userLocation}
                    />
                  </div>
                  {userLocation && (
                    <p className="text-xs text-gray-500 px-4">
                      {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </p>
                  )}
                  <button
                    onClick={() => { Logout(); setShowMenu(false); }}
                    className="w-full mt-4 bg-red-500 text-white font-medium px-4 py-3 rounded-full hover:bg-red-600 transition-colors"
                  >
                    {t('navbar.logout')}
                  </button>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Navbar
