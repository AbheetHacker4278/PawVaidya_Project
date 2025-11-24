import React from 'react'
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PawBackground from '../components/PawBackground'

const About = () => {
    const { t } = useTranslation();

    const features = [
        {
            title: t('about.efficiency'),
            description: t('about.efficiencyText'),
            icon: '⚡',
            gradient: 'from-yellow-400 to-orange-500',
            iconBg: 'bg-yellow-100',
        },
        {
            title: t('about.convenience'),
            description: t('about.convenienceText'),
            icon: '🎯',
            gradient: 'from-green-400 to-emerald-500',
            iconBg: 'bg-green-100',
        },
        {
            title: t('about.personalization'),
            description: t('about.personalizationText'),
            icon: '❤️',
            gradient: 'from-pink-400 to-rose-500',
            iconBg: 'bg-pink-100',
        }
    ];

    const stats = [
        { number: '500+', label: 'Vets', icon: '👨‍⚕️', gradient: 'from-green-500 to-emerald-600' },
        { number: '50k+', label: 'Pets', icon: '🐾', gradient: 'from-blue-500 to-cyan-600' },
        { number: '100+', label: 'Cities', icon: '📍', gradient: 'from-purple-500 to-pink-600' },
        { number: '4.9⭐', label: 'Rating', icon: '⭐', gradient: 'from-amber-500 to-orange-600' }
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
                        {t('about.title')}
                    </h1>

                    <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-3" />

                    <p className="text-base md:text-lg text-gray-800 font-medium">
                        Your trusted partner in pet healthcare
                    </p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative z-10 max-w-5xl mx-auto px-4 mb-8"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.08, duration: 0.3 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-white/50"
                        >
                            <div className="text-2xl mb-1.5">{stat.icon}</div>
                            <div className={`text-xl md:text-2xl font-bold mb-0.5 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                                {stat.number}
                            </div>
                            <div className="text-xs text-gray-700 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative z-10 max-w-5xl mx-auto px-4 mb-8"
            >
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/60">
                    <div className="flex flex-col md:flex-row gap-6 p-6 md:p-7">
                        {/* Image Side - Small 3D */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
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
                                        src="https://i.ibb.co/6Wzk9nP/DALL-E-2024-11-24-18-06-17-A-cheerful-veterinarian-surrounded-by-various-animals-including-dogs-cats.webp"
                                        alt="Veterinarian with animals"
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
                                        Welcome to PawVaidya
                                    </h2>
                                </div>
                                <p className="text-gray-800 leading-relaxed font-medium">
                                    {t('about.welcome')}
                                </p>
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {t('about.description')}
                            </p>

                            {/* Vision Section */}
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                                        <span className="text-lg">🎯</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1B3726] mb-1">
                                            {t('about.vision')}
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {t('about.visionText')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Why Choose Us Section */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 pb-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-6"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1B3726] mb-2">
                        Why Choose <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">PawVaidya</span>?
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="group bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60"
                        >
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.iconBg} rounded-xl mb-3 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-[#1B3726] mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {feature.description}
                            </p>

                            {/* Bottom accent */}
                            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${feature.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default About