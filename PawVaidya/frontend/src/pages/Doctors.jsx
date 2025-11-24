import React, { useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import AnimalHealthChatbot from '../components/AnimalHealthChatbot';
import { translateSpeciality } from '../utils/translateSpeciality';
import { motion, AnimatePresence } from 'framer-motion';
import { filterDoctorsByDistance, formatDistance } from '../utils/geolocation';
import LocationRefreshButton from '../components/LocationRefreshButton';
import axios from 'axios';
import { toast } from 'react-toastify';

export const Doctors = () => {
  const { t } = useTranslation();
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showfilter, setshowfilter] = useState(false);
  const [location, setLocation] = useState(''); // Track selected location
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({});
  const observerRef = useRef(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const { doctors, userLocation, refreshUserLocation, backendurl } = useContext(AppContext)
  const navigate = useNavigate();

  const filterNearbyDoctors = () => {
    if (!userLocation) return [];
    
    // Filter doctors within 5km radius
    const nearby = filterDoctorsByDistance(doctors, userLocation.latitude, userLocation.longitude, 5);
    return nearby;
  };

  const fetchNearbyDoctorsFromAPI = async () => {
  if (!userLocation) return;
  
  setIsLoadingNearby(true);
  setNearbyError(null);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to use nearby doctors feature');
      setNearbyError('Please login to use nearby doctors feature');
      return;
    }

    const response = await axios.post(
      `${backendurl}/api/user/nearby-doctors`,
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        maxDistance: 5
      },
      {
        headers: {
          token: token
        }
      }
    );

    if (response.data.success) {
      setNearbyDoctors(response.data.doctors);
      if (response.data.doctors.length === 0) {
        toast.info('No doctors found within 5km radius');
      }
    } else {
      toast.error('Failed to fetch nearby doctors');
      setNearbyError('Failed to fetch nearby doctors');
    }
  } catch (error) {
    console.error('Error fetching nearby doctors:', error);
    toast.error('Error fetching nearby doctors');
    const errorMessage = error.response?.data?.message || 'Error fetching nearby doctors';
    setNearbyError(errorMessage);
  } finally {
    setIsLoadingNearby(false);
  }
};

  const applyFilter = () => {
    console.log('Applying filter for speciality:', speciality);
    console.log('Selected location:', location);
    console.log('Doctors:', doctors);

    let filtered = doctors;

    // Apply nearby filter first if enabled
    if (showNearbyOnly && userLocation) {
      // Use API for nearby doctors if available, otherwise fall back to client-side filtering
      if (nearbyDoctors.length > 0) {
        filtered = nearbyDoctors;
      } else {
        filtered = filterNearbyDoctors();
      }
    }

    if (speciality) {
      filtered = filtered.filter(doc =>
        doc.speciality.toLowerCase() === speciality.toLowerCase()
      );
    }

    if (location) {
      filtered = filtered.filter(doc =>
        doc.address?.Location.toLowerCase() === location.toLowerCase()
      );
    }

    console.log('Filtered Doctors:', filtered);
    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, location, showNearbyOnly, userLocation]); // Re-run the filter when speciality, location, or nearby filter changes

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showNearbyOnly && userLocation) {
      fetchNearbyDoctorsFromAPI();
    }
  }, [showNearbyOnly, userLocation]);

  const handleLocationFilter = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative py-8 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-2xl font-bold text-center text-gray-800 mb-4">{t('doctors.selectLocation')}</p>
        <div className="flex justify-center">
          <motion.select
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="text-zinc rounded-2xl px-6 py-3 bg-gradient-to-r from-[#785647] to-[#5A4035] text-center hover:shadow-xl transition-all duration-300 cursor-pointer font-medium"
            value={location}
            onChange={(e) => handleLocationFilter(e.target.value)}
          >
            <option value="">{t('doctors.selectLocationOption')}</option>
            {[
              { value: 'New Delhi', label: t('locations.newDelhi') },
              { value: 'Madhya Pradesh', label: t('locations.madhyaPradesh') },
              { value: 'Mumbai', label: t('locations.mumbai') },
              { value: 'Chhattisgarh', label: t('locations.chhattisgarh') }
            ].map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </motion.select>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`py-3 px-6 rounded-2xl text-sm font-semibold transition-all justify-center text-center sm:hidden shadow-lg mb-4 ${showfilter ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-white border-2 border-green-500 text-green-600'}`} 
          onClick={() => setshowfilter(prev => !prev)}
        >
          {t('doctors.filters')}
        </motion.button>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='text-xl text-gray-700 text-center font-semibold mb-6'
        >
          {t('doctors.browseSpeciality')}
        </motion.p>
        
        {/* Location and Nearby Doctors Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-6'
        >
          <LocationRefreshButton 
            variant="button" 
            size="md" 
            onLocationUpdate={refreshUserLocation}
            location={userLocation}
          />
          
          {userLocation && (
            <div className='flex items-center gap-2'>
              <input
                type="checkbox"
                id="nearby-only"
                checked={showNearbyOnly}
                onChange={(e) => setShowNearbyOnly(e.target.checked)}
                className='w-4 h-4 text-green-600 rounded focus:ring-green-500'
              />
              <label htmlFor="nearby-only" className='text-sm font-medium text-gray-700'>
                Show nearby doctors only
              </label>
            </div>
          )}
        </motion.div>
        <div className={`flex flex-col sm:flex-row item-start gap-6 mt-5 ${showfilter ? 'flex' : 'hidden sm:flex'}`}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='flex flex-col gap-3 text-sm sm:min-w-[240px]'
          >
            <motion.p 
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => speciality === 'Marine vet' ? navigate('/doctors') : navigate('/doctors/Marine vet')} 
              className={`w-[94vw] sm:w-auto px-4 py-3 rounded-xl transition-all cursor-pointer font-semibold shadow-md ${speciality === "Marine vet" ? "bg-gradient-to-r from-[#489065] to-[#326546] text-white shadow-lg" : "bg-white border-2 border-[#489065] text-[#489065] hover:bg-green-50"}`}
            >
              {t('doctorSpecialities.marineVet')}
            </motion.p>
            <motion.p 
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => speciality === 'smallAnimalVet' ? navigate('/doctors') : navigate('/doctors/smallAnimalVet')} 
              className={`w-[94vw] sm:w-auto px-4 py-3 rounded-xl transition-all cursor-pointer font-semibold shadow-md ${speciality === "smallAnimalVet" ? "bg-gradient-to-r from-[#489065] to-[#326546] text-white shadow-lg" : "bg-white border-2 border-[#489065] text-[#489065] hover:bg-green-50"}`}
            >
              {t('doctorSpecialities.smallAnimalVet')}
            </motion.p>
            <motion.p 
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => speciality === 'Large animal vet' ? navigate('/doctors') : navigate('/doctors/Large animal vet')} 
              className={`w-[94vw] sm:w-auto px-4 py-3 rounded-xl transition-all cursor-pointer font-semibold shadow-md ${speciality === "Large animal vet" ? "bg-gradient-to-r from-[#489065] to-[#326546] text-white shadow-lg" : "bg-white border-2 border-[#489065] text-[#489065] hover:bg-green-50"}`}
            >
              {t('doctorSpecialities.largeAnimalVet')}
            </motion.p>
            <motion.p 
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => speciality === 'Military vet' ? navigate('/doctors') : navigate('/doctors/Military vet')} 
              className={`w-[94vw] sm:w-auto px-4 py-3 rounded-xl transition-all cursor-pointer font-semibold shadow-md ${speciality === "Military vet" ? "bg-gradient-to-r from-[#489065] to-[#326546] text-white shadow-lg" : "bg-white border-2 border-[#489065] text-[#489065] hover:bg-green-50"}`}
            >
              {t('doctorSpecialities.militaryVet')}
            </motion.p>
          </motion.div>
          <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100"
                  >
                    <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
                      <div className="absolute top-4 right-4 w-20 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  </motion.div>
                ))
              ) : filterDoc.length > 0 ? (
                filterDoc.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      type: "spring",
                      damping: 15,
                      stiffness: 100,
                      delay: index * 0.1 
                    }}
                    whileHover={{ y: -12, transition: { duration: 0.3 } }}
                    whileTap={{ scale: 0.97 }}
                    onHoverStart={() => setHoveredCard(index)}
                    onHoverEnd={() => setHoveredCard(null)}
                    onClick={() => navigate(`/appointment/${item._id}`)}
                    className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
                  >
                    {/* Gradient overlay on hover */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-transparent to-blue-400/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      initial={false}
                      animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                    />

                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
                      <motion.img 
                        className="w-full h-full object-cover" 
                        src={item.image} 
                        alt={item.name}
                        animate={{ scale: hoveredCard === index ? 1.1 : 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      
                      {/* Availability Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 shadow-lg ${item.available ? 'bg-green-500/90 text-white' : "bg-gray-500/90 text-white"}`}>
                        <motion.p 
                          className={`w-2.5 h-2.5 rounded-full ${item.available ? 'bg-white' : "bg-gray-300"}`}
                          animate={item.available ? {
                            scale: [1, 1.3, 1],
                            boxShadow: [
                              '0 0 0 0 rgba(255,255,255,0.7)',
                              '0 0 0 6px rgba(255,255,255,0)',
                              '0 0 0 0 rgba(255,255,255,0)'
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <p className="text-xs font-semibold">{item.available ? t('common.available') : t('common.notAvailable')}</p>
                      </div>
                      {showNearbyOnly && userLocation && item.distance !== undefined && (
                        <div className="mb-3">
                          <span className='inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200 shadow-sm'>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {formatDistance(item.distance)}
                          </span>
                        </div>
                      )}

                      {/* Decorative corner */}
                      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/30 to-transparent rounded-tl-full" />
                    </div>

                    {/* Content Section */}
                    <div className="p-5 bg-gradient-to-b from-white to-gray-50/50">
                      <p className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5A4035] transition-colors duration-300">{item.name}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm">
                          {item.address?.Location || t('doctors.unknownLocation')}
                        </span>
                        <span className='inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 shadow-sm'>
                          {item.address.line}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm font-medium">{translateSpeciality(item.speciality, t)}</p>

                      {/* View Details - appears on hover */}
                      <motion.div 
                        className="mt-4 pt-3 border-t border-gray-200"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-center gap-2 text-[#5A4035] font-semibold text-sm">
                          <span>View Profile</span>
                          <motion.svg 
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ x: hoveredCard === index ? 5 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </div>
                      </motion.div>
                    </div>

                    {/* Bottom glow effect */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-green-400"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: hoveredCard === index ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-20"
                >
                  <p className="text-2xl text-gray-500 font-semibold">{t('doctors.noDoctors')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <motion.div 
        className="relative mt-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <AnimalHealthChatbot />
      </motion.div>
    </motion.div>
  );
};

export default Doctors;
