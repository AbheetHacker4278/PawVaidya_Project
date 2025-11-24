import React, { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircleQuestion, MapPin, Calendar, Home, User, FileText, Info, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { translateSpeciality } from '../utils/translateSpeciality';

const AnimalHealthChatbot = () => {
  const { t, i18n } = useTranslation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInitialPopup, setShowInitialPopup] = useState(true);
  const [showDoctorRecommendations, setShowDoctorRecommendations] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [showAllNearbyDoctors, setShowAllNearbyDoctors] = useState(false);
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const { doctors, userdata, token } = useContext(AppContext);

  // Initialize Gemini
  const apikey2 = import.meta.env.VITE_API_KEY3;
  const genAI = new GoogleGenerativeAI(apikey2);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, showDoctorRecommendations, showAllNearbyDoctors]);

  // Initial welcome message and nearby doctors fetch
  useEffect(() => {
    const welcomeMessage = token && userdata?.name 
      ? t('chatbot.greeting', { name: userdata.name })
      : t('chatbot.greeting', { name: '' });
    
    setChatMessages([
      {
        role: 'assistant',
        text: welcomeMessage.replace('Hi!  ', 'Hi! ').replace('Hi! ', `Hi!${userdata?.name ? ` ${userdata.name}` : ''} `)
      }
    ]);

    // Auto-hide initial popup after 5 seconds
    const popupTimer = setTimeout(() => {
      setShowInitialPopup(false);
    }, 5000);

    // Load nearby doctors based on user location when chatbot opens
    const userLocation = getUserLocation();
    if (userLocation && doctors?.length > 0) {
      const doctorsInUserLocation = doctors.filter(doc =>
        doc.address?.Location?.toLowerCase() === userLocation.toLowerCase()
      );
      setNearbyDoctors(doctorsInUserLocation);
    }

    return () => clearTimeout(popupTimer);
  }, [doctors, userdata, t]);

  // Function to check if response indicates poor health
  const indicatesPoorHealth = (response) => {
    const poorHealthKeywords = [
      'emergency', 'urgent', 'immediate', 'vet', 'veterinarian', 'doctor',
      'consult', 'serious', 'critical', 'treatment', 'medical attention',
      'concerning', 'worrying', 'dangerous', 'severe', 'professional help',
      'specialist', 'consultation', 'care', 'professional', 'clinic', 'hospital'
    ];

    return poorHealthKeywords.some(keyword =>
      response.toLowerCase().includes(keyword)
    );
  };

  // Get user's current location
  const getUserLocation = () => {
    return userdata?.address?.Location || userdata?.address?.LOCATION || userdata?.address?.LINE || userdata?.address?.line;
  };

  // Determine pet type from query
  const determinePetType = (query) => {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('dog') || queryLower.includes('puppy')) {
      return 'smallAnimalVet';
    } else if (queryLower.includes('cat') || queryLower.includes('kitten')) {
      return 'smallAnimalVet';
    } else if (queryLower.includes('fish') || queryLower.includes('aquarium')) {
      return 'Marine vet';
    } else if (queryLower.includes('bird') || queryLower.includes('parrot') || queryLower.includes('avian')) {
      return 'Avian vet';
    } else if (queryLower.includes('reptile') || queryLower.includes('snake') || queryLower.includes('lizard')) {
      return 'Exotic vet';
    } else if (queryLower.includes('horse') || queryLower.includes('cow') ||
      queryLower.includes('livestock')) {
      return 'Large animal vet';
    } else if (queryLower.includes('military') || queryLower.includes('service animal')) {
      return 'Military vet';
    } else {
      return 'smallAnimalVet'; // Default to small animal vet
    }
  };

  // Function to get relevant doctors based on user location and pet issue
  const getRelevantDoctors = (query) => {
    if (!doctors || doctors.length === 0) return [];

    const userLocation = getUserLocation();
    const petType = determinePetType(query);
    
    let filteredDoctors = [...doctors];

    if (userLocation) {
      const locationFiltered = filteredDoctors.filter(doc =>
        doc.address?.Location?.toLowerCase() === userLocation.toLowerCase()
      );
      
      if (locationFiltered.length > 0) {
        filteredDoctors = locationFiltered;
      }
    }
    
    if (petType) {
      const specialityFiltered = filteredDoctors.filter(doc =>
        doc.speciality?.toLowerCase() === petType.toLowerCase()
      );
      
      if (specialityFiltered.length > 0) {
        filteredDoctors = specialityFiltered;
      }
    }
    
    filteredDoctors.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return 0;
    });
    
    return filteredDoctors.slice(0, 3);
  };

  // Function to get all doctors in user's location with optional speciality filter
  const getAllDoctorsInLocation = (speciality = '') => {
    if (!doctors || doctors.length === 0) return [];
    
    const userLocation = getUserLocation();
    if (!userLocation) return [];
    
    let locationDoctors = doctors.filter(doc =>
      doc.address?.Location?.toLowerCase() === userLocation.toLowerCase()
    );
    
    if (speciality) {
      locationDoctors = locationDoctors.filter(doc =>
        doc.speciality?.toLowerCase() === speciality.toLowerCase()
      );
    }
    
    locationDoctors.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return 0;
    });
    
    return locationDoctors;
  };

  // Get all unique specialities from doctors in user's location
  const getUniqueSpecialities = () => {
    const userLocation = getUserLocation();
    if (!userLocation || !doctors || doctors.length === 0) return [];
    
    const locationDoctors = doctors.filter(doc =>
      doc.address?.Location?.toLowerCase() === userLocation.toLowerCase()
    );
    
    const specialities = locationDoctors.map(doc => doc.speciality).filter(Boolean);
    return [...new Set(specialities)];
  };

  // Check if input is a navigation command
  const isNavigationCommand = (input) => {
    const navKeywords = [
      'go to', 'show', 'open', 'navigate', 'take me', 'visit', 'view', 'help', 'navigation',
      'doctors', 'profile', 'appointments', 'blogs', 'about', 'contact', 'home',
      'book appointment', 'my profile', 'my appointments', 'community blogs'
    ];
    const inputLower = input.toLowerCase();
    return navKeywords.some(keyword => inputLower.includes(keyword));
  };

  // Handle navigation commands
  const handleNavigationCommand = (input) => {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('doctors') || inputLower.includes('doctor')) {
      navigate('/doctors');
      setIsChatbotOpen(false);
      return true;
    }
    if (inputLower.includes('profile') || inputLower.includes('my profile')) {
      if (token) {
        navigate('/my-profile');
        setIsChatbotOpen(false);
        return true;
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: t('chatbot.greeting') + ' ' + t('chatbot.navigationHelp') + '\n\n' + t('chatbot.helpCommands')
        }]);
        return false;
      }
    }
    if (inputLower.includes('appointment') || inputLower.includes('appointments') || inputLower.includes('my appointments')) {
      if (token) {
        navigate('/my-appointments');
        setIsChatbotOpen(false);
        return true;
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: t('chatbot.greeting') + ' ' + t('chatbot.navigationHelp') + '\n\n' + t('chatbot.helpCommands')
        }]);
        return false;
      }
    }
    if (inputLower.includes('blog') || inputLower.includes('blogs')) {
      navigate('/community-blogs');
      setIsChatbotOpen(false);
      return true;
    }
    if (inputLower.includes('about')) {
      navigate('/about');
      setIsChatbotOpen(false);
      return true;
    }
    if (inputLower.includes('contact')) {
      navigate('/contact');
      setIsChatbotOpen(false);
      return true;
    }
    if (inputLower.includes('home')) {
      navigate('/');
      setIsChatbotOpen(false);
      return true;
    }
    if (inputLower.includes('help') || inputLower.includes('navigation')) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: t('chatbot.navigationHelp') + '\n\n' + t('chatbot.helpCommands') + '\n\n' + t('chatbot.quickActions') + ':'
      }]);
      setShowQuickActions(true);
      return false;
    }
    return false;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const inputText = userInput.trim();
    const newMessages = [...chatMessages, { role: 'user', text: inputText }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    setShowDoctorRecommendations(false);
    setShowAllNearbyDoctors(false);
    setShowQuickActions(false);

    // Check if it's a navigation command first
    if (isNavigationCommand(inputText)) {
      const handled = handleNavigationCommand(inputText);
      setIsLoading(false);
      if (handled) return;
    }

    try {
      // Use Gemini for all responses
      const prompt = i18n.language !== 'en'
        ? `Provide a very concise (max 3 lines) professional veterinary response in ${i18n.language} to: ${inputText}`
        : `Provide a very concise (max 3 lines) professional veterinary response to: ${inputText}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: response
        }
      ]);

      // Check if response indicates a health concern
      if (indicatesPoorHealth(response) || indicatesPoorHealth(inputText)) {
        const relevantDocs = getRelevantDoctors(inputText);
        if (relevantDocs.length > 0) {
          setRecommendedDoctors(relevantDocs);
          setShowDoctorRecommendations(true);
        }
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setError(t('chatbot.connectionError'));

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: t('chatbot.connectionError') }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing all nearby doctors
  const handleViewAllNearbyDoctors = () => {
    const allDocs = getAllDoctorsInLocation(selectedSpeciality);
    setNearbyDoctors(allDocs);
    setShowAllNearbyDoctors(true);
    setShowDoctorRecommendations(false);
  };

  // Filter nearby doctors by speciality
  const filterBySpeciality = (speciality) => {
    setSelectedSpeciality(speciality);
    const filteredDocs = getAllDoctorsInLocation(speciality);
    setNearbyDoctors(filteredDocs);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle doctor appointment booking
  const handleBookAppointment = (doctorId) => {
    navigate(`/appointment/${doctorId}`);
    setIsChatbotOpen(false);
  };

  // Get user location display name
  const getUserLocationDisplay = () => {
    const userLocation = getUserLocation();
    return userLocation || t('doctors.unknownLocation');
  };

  const uniqueSpecialities = getUniqueSpecialities();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Initial Popup */}
      <AnimatePresence>
        {showInitialPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">🩺</span>
              <h3 className="text-lg font-semibold text-[#5A4035]">{t('chatbot.welcome')}</h3>
            </div>
            <p className="text-zinc-600 mb-2">
              {userdata?.name ? `Hi ${userdata.name}! ` : ''}{t('chatbot.welcomeMessage')}
            </p>
            {getUserLocation() && (
              <div className="bg-[#f8f4e9] p-2 rounded-lg mb-3 flex items-center text-sm">
                <MapPin className="w-4 h-4 text-[#5A4035] mr-1" />
                <span>{t('chatbot.yourLocation')} <span className="font-medium">{getUserLocationDisplay()}</span></span>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowInitialPopup(false)}
                className="bg-[#5A4035] text-white px-4 py-2 rounded-full"
              >
                {t('chatbot.gotIt')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Launcher */}
      <motion.div
        className="w-14 h-14 border-2 border-[#5A4032] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <img src="https://i.ibb.co/0jC6VMm0/PV-removebg-preview.png" alt="" />
        <div className="w-8 h-8" />
      </motion.div>

      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-[#5A4035] text-white p-4 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{t('chatbot.animalHealthAssistant')}</h2>
                {getUserLocation() && (
                  <div className="flex items-center text-xs mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{getUserLocationDisplay()}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  whileHover={{ scale: 1.1 }}
                  className="bg-[#F2E4C6] text-[#5A4035] p-1 rounded-full focus:outline-none"
                  title={t('chatbot.quickActions')}
                >
                  <MessageCircleQuestion className="w-5 h-5" />
                </motion.button>
                {nearbyDoctors.length > 0 && (
                  <motion.button
                    onClick={handleViewAllNearbyDoctors}
                    whileHover={{ scale: 1.1 }}
                    className="bg-[#F2E4C6] text-[#5A4035] p-1 rounded-full focus:outline-none"
                    title={t('chatbot.viewAllNearby')}
                  >
                    <MapPin className="w-5 h-5" />
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setIsChatbotOpen(false)}
                  whileHover={{ rotate: 90 }}
                  className="focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 max-h-[400px]">
              <AnimatePresence>
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start ${msg.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                      }`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user'
                        ? 'bg-[#F2E4C6] text-[#5A4035] ml-auto'
                        : 'bg-[#F2E4C6] text-zinc-600'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        {msg.role === 'assistant' && (
                          <span className="text-xl mr-2">🩺</span>
                        )}
                        <span>{msg.text}</span>
                        {msg.role === 'user' && (
                          <span className="text-xl ml-2">👤</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Doctor Recommendations based on query */}
              {showDoctorRecommendations && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-[#fff8ee] border border-[#e9dac0] rounded-lg"
                >
                  <h3 className="font-medium text-[#5A4035] mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> {t('chatbot.recommendedDoctors')}
                  </h3>
                  <div className="space-y-3">
                    {recommendedDoctors.map(doctor => (
                      <div key={doctor._id} className="p-2 bg-white rounded-md border border-[#e9dac0] hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-[#5A4035]">{doctor.name}</h4>
                            <p className="text-xs text-gray-600">{translateSpeciality(doctor.speciality, t)}</p>
                            <div className="flex items-center text-xs mt-1">
                              <MapPin className="w-3 h-3 mr-1 text-[#8b6a5e]" />
                              <span>{doctor.address?.Location || t('chatbot.locationUnavailable')}</span>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${doctor.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {doctor.available ? t('chatbot.available') : t('chatbot.busy')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleBookAppointment(doctor._id)}
                          className="mt-2 w-full bg-[#5A4035] text-white text-xs py-1.5 rounded-md flex items-center justify-center"
                        >
                          <Calendar className="w-3 h-3 mr-1" /> {t('chatbot.bookAppointment')}
                        </button>
                      </div>
                    ))}
                    {recommendedDoctors.length > 0 && (
                      <button
                        onClick={handleViewAllNearbyDoctors}
                        className="w-full text-[#5A4035] text-sm py-1 underline flex items-center justify-center"
                      >
                        {t('chatbot.viewAllDoctors')} {getUserLocationDisplay()}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* All Nearby Doctors View */}
              {showAllNearbyDoctors && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-[#fff8ee] border border-[#e9dac0] rounded-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-[#5A4035] flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {t('chatbot.vetsIn')} {getUserLocationDisplay()}
                    </h3>
                    <button
                      onClick={() => setShowAllNearbyDoctors(false)}
                      className="text-[#5A4035] text-xs p-1 rounded-full hover:bg-[#e9dac0]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Speciality filter */}
                  {uniqueSpecialities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button
                        onClick={() => filterBySpeciality('')}
                        className={`text-xs px-2 py-1 rounded-full ${selectedSpeciality === ''
                          ? 'bg-[#5A4035] text-white'
                          : 'bg-[#e9dac0] text-[#5A4035]'
                          }`}
                      >
                        {t('chatbot.all')}
                      </button>
                      {uniqueSpecialities.map(spec => (
                        <button
                          key={spec}
                          onClick={() => filterBySpeciality(spec)}
                          className={`text-xs px-2 py-1 rounded-full ${selectedSpeciality === spec
                            ? 'bg-[#5A4035] text-white'
                            : 'bg-[#e9dac0] text-[#5A4035]'
                            }`}
                        >
                          {translateSpeciality(spec, t)}
                        </button>
                      ))}
                    </div>
                  )}

                  {nearbyDoctors.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {nearbyDoctors.map(doctor => (
                        <div key={doctor._id} className="p-2 bg-white rounded-md border border-[#e9dac0] hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-[#5A4035]">{doctor.name}</h4>
                              <p className="text-xs text-gray-600">{translateSpeciality(doctor.speciality, t)}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${doctor.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {doctor.available ? t('chatbot.available') : t('chatbot.busy')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleBookAppointment(doctor._id)}
                            className="mt-2 w-full bg-[#5A4035] text-white text-xs py-1.5 rounded-md flex items-center justify-center"
                          >
                            <Calendar className="w-3 h-3 mr-1" /> {t('chatbot.bookAppointment')}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-md text-center text-sm text-gray-600">
                      {selectedSpeciality 
                        ? `${t('chatbot.noDoctorsWithSpeciality')} "${translateSpeciality(selectedSpeciality, t)}"`
                        : t('chatbot.noDoctorsFound')
                      }
                    </div>
                  )}
                </motion.div>
              )}

              {/* Quick Actions */}
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-[#fff8ee] border border-[#e9dac0] rounded-lg"
                >
                  <h3 className="font-medium text-[#5A4035] mb-3 flex items-center">
                    <MessageCircleQuestion className="w-4 h-4 mr-1" /> {t('chatbot.quickActions')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { navigate('/doctors'); setIsChatbotOpen(false); }}
                      className="flex items-center gap-2 p-2 bg-white rounded-md border border-[#e9dac0] hover:bg-[#f8f4e9] transition-colors text-xs"
                    >
                      <Home className="w-4 h-4" /> {t('chatbot.viewDoctors')}
                    </button>
                    {token && (
                      <button
                        onClick={() => { navigate('/my-profile'); setIsChatbotOpen(false); }}
                        className="flex items-center gap-2 p-2 bg-white rounded-md border border-[#e9dac0] hover:bg-[#f8f4e9] transition-colors text-xs"
                      >
                        <User className="w-4 h-4" /> {t('chatbot.myProfile')}
                      </button>
                    )}
                    {token && (
                      <button
                        onClick={() => { navigate('/my-appointments'); setIsChatbotOpen(false); }}
                        className="flex items-center gap-2 p-2 bg-white rounded-md border border-[#e9dac0] hover:bg-[#f8f4e9] transition-colors text-xs"
                      >
                        <Calendar className="w-4 h-4" /> {t('chatbot.myAppointments')}
                      </button>
                    )}
                    <button
                      onClick={() => { navigate('/community-blogs'); setIsChatbotOpen(false); }}
                      className="flex items-center gap-2 p-2 bg-white rounded-md border border-[#e9dac0] hover:bg-[#f8f4e9] transition-colors text-xs"
                    >
                      <FileText className="w-4 h-4" /> {t('chatbot.communityBlogs')}
                    </button>
                    <button
                      onClick={() => { navigate('/about'); setIsChatbotOpen(false); }}
                      className="flex items-center gap-2 p-2 bg-white rounded-md border border-[#e9dac0] hover:bg-[#f8f4e9] transition-colors text-xs"
                    >
                      <Info className="w-4 h-4" /> {t('chatbot.aboutUs')}
                    </button>
                    <button
                      onClick={() => { navigate('/contact'); setIsChatbotOpen(false); }}
                      className="flex items-center gap-2 p-2 bg-white rounded-md border border-[#e9dac0] hover:bg-[#f8f4e9] transition-colors text-xs"
                    >
                      <Phone className="w-4 h-4" /> {t('chatbot.contactUs')}
                    </button>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 p-3 rounded-2xl flex items-center">
                    <span className="text-xl mr-2">🩺</span>
                    {t('chatbot.typing')}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 flex items-center space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot.askAboutAnimalHealth')}
                className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#5A4035]"
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!userInput.trim()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-[#5A4035] text-white p-2 rounded-full disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimalHealthChatbot;