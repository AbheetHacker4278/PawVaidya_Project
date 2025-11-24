import React from 'react'
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AnimalHealthChatbot from '../components/AnimalHealthChatbot'
import PawBackground from '../components/PawBackground'

const Contact = () => {
  const { t } = useTranslation();

  const contactInfo = [
    {
      icon: '📍',
      title: t('contact.ourOffice'),
      content: t('contact.address'),
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-100'
    },
    {
      icon: '📞',
      title: 'Get in Touch',
      content: `${t('contact.phone')}\n${t('contact.email')}`,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100'
    },
    {
      icon: '💼',
      title: t('contact.career'),
      content: t('contact.careerText'),
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-100'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E8F5E9] via-[#F2E4C6] to-[#E3F2FD] overflow-hidden">
      <PawBackground density="light" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-8 pb-6 px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-block mb-2"
          >
            <span className="text-5xl">🦥</span>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#1B3726] mb-2">
            {t('contact.title')}
          </h1>

          <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-3" />

          <p className="text-base md:text-lg text-gray-800 font-medium">
            We're here to help you and your pets
          </p>
        </div>
      </motion.div>

      {/* Main Contact Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 max-w-5xl mx-auto px-4 mb-8"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/60">
          <div className="flex flex-col md:flex-row gap-6 p-6 md:p-7">
            {/* Image Side - Small 3D */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex-shrink-0 mx-auto md:mx-0"
            >
              <div className="relative group">
                {/* 3D Border Layers */}
                <div className="absolute -inset-1 bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-green-300 via-blue-300 to-purple-300 rounded-2xl"></div>

                {/* Image Container with 3D effect */}
                <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent z-10"></div>
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
                    alt="Veterinary Contact"
                  />
                  {/* Inner shadow for depth */}
                  <div className="absolute inset-0 shadow-inner"></div>
                </div>

                {/* 3D Bottom accent */}
                <div className="absolute -bottom-2 left-2 right-2 h-2 bg-gradient-to-r from-green-600/30 via-blue-600/30 to-purple-600/30 rounded-full blur-sm"></div>
              </div>
            </motion.div>

            {/* Content Side */}
            <div className="flex-1 space-y-5">
              {/* Welcome Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👋</span>
                  <h2 className="text-xl md:text-2xl font-bold text-[#1B3726]">
                    Let's Connect
                  </h2>
                </div>
                <p className="text-gray-800 leading-relaxed font-medium">
                  Have questions about your pet's health? We're here to help!
                </p>
              </div>

              {/* Quick Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-3 border border-green-100 flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Call Us</div>
                    <div className="text-sm font-bold text-gray-800">{t('contact.phone')}</div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Email Us</div>
                    <div className="text-sm font-bold text-gray-800">{t('contact.email')}</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>📅</span>
                Book an Appointment
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Information Cards */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B3726] mb-2">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Other Ways</span> to Reach Us
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 ${info.iconBg} rounded-xl mb-3 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {info.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[#1B3726] mb-2">
                {info.title}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                {info.content}
              </p>

              {/* Bottom accent */}
              <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${info.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chatbot Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="relative z-10 pb-10"
      >
        <AnimalHealthChatbot />
      </motion.div>
    </div>
  )
}

export default Contact
