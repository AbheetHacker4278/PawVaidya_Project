import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState(null);

  const categories = [
    { id: 'all', name: 'All Questions', icon: '📚' },
    { id: 'appointments', name: 'Appointments', icon: '📅' },
    { id: 'payments', name: 'Payments', icon: '💳' },
    { id: 'pets', name: 'Pet Care', icon: '🐾' },
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'doctors', name: 'Doctors', icon: '👨‍⚕️' }
  ];

  const faqs = [
    {
      category: 'appointments',
      question: 'How do I book an appointment with a veterinarian?',
      answer: 'To book an appointment, log in to your account, browse available doctors, select your preferred veterinarian, choose a suitable time slot, and confirm your booking. You will receive a confirmation email and notification.'
    },
    {
      category: 'appointments',
      question: 'Can I cancel or reschedule my appointment?',
      answer: 'Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time. Go to "My Appointments" section, select the appointment, and choose the cancel or reschedule option.'
    },
    {
      category: 'appointments',
      question: 'What happens if I miss my appointment?',
      answer: 'If you miss an appointment without prior cancellation, it may affect your ability to book future appointments. Please try to cancel at least 24 hours in advance if you cannot attend.'
    },
    {
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets. You can also choose to pay in cash during your visit for in-person consultations.'
    },
    {
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, all payment transactions are processed through secure, encrypted payment gateways. We do not store your complete card details on our servers.'
    },
    {
      category: 'payments',
      question: 'Can I get a refund if I cancel my appointment?',
      answer: 'Refund policies depend on when you cancel. Cancellations made 24+ hours before the appointment are eligible for full refund. Cancellations within 24 hours may incur a cancellation fee.'
    },
    {
      category: 'pets',
      question: 'What types of pets do you provide services for?',
      answer: 'We provide veterinary services for dogs, cats, birds, rabbits, and other small animals. Our network of veterinarians specializes in various pet types.'
    },
    {
      category: 'pets',
      question: 'How do I add my pet\'s information to my profile?',
      answer: 'Go to "My Profile" section, click on "Add Pet" or "Edit Pet Information", and fill in details like pet type, breed, age, gender, and any medical history. This helps doctors provide better care.'
    },
    {
      category: 'pets',
      question: 'Can I book appointments for multiple pets?',
      answer: 'Yes, you can add multiple pets to your profile and book separate appointments for each pet. Make sure to select the correct pet when booking an appointment.'
    },
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click on "Sign Up" button, provide your email, phone number, and create a password. You will receive a verification email to activate your account.'
    },
    {
      category: 'account',
      question: 'I forgot my password. How can I reset it?',
      answer: 'Click on "Forgot Password" on the login page, enter your registered email address, and you will receive a password reset link. Follow the instructions in the email to set a new password.'
    },
    {
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Log in to your account, go to "My Profile" section, click on "Edit Profile", update your information, and save changes. You can update your name, contact details, address, and pet information.'
    },
    {
      category: 'account',
      question: 'Is my personal information safe?',
      answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We comply with data protection regulations and never share your information without consent.'
    },
    {
      category: 'doctors',
      question: 'How do I choose the right veterinarian for my pet?',
      answer: 'You can browse doctor profiles to see their specializations, experience, ratings, and reviews. Filter doctors by specialty, location, or availability to find the best match for your pet\'s needs.'
    },
    {
      category: 'doctors',
      question: 'Can I communicate with the doctor before booking?',
      answer: 'Yes, you can use our chat feature to ask preliminary questions to the doctor before booking an appointment. This helps you understand if the doctor is the right fit for your pet.'
    },
    {
      category: 'doctors',
      question: 'What if I\'m not satisfied with the consultation?',
      answer: 'If you have concerns about your consultation, please contact our support team. We take feedback seriously and will work to resolve any issues. You can also leave a review to help other pet owners.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-[#f2e4c7] from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <HelpCircle className="w-16 h-16 text-green-600 mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about PawVaidya services, appointments, and pet care
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-700 shadow-lg transition-all"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all shadow-md ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto space-y-4"
        >
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-green-600" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-2">
                        <div className="h-px bg-gradient-to-r from-green-200 via-green-400 to-green-200 mb-4"></div>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 text-lg">No FAQs found matching your search.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Still have questions?</h2>
            <p className="text-green-100 text-lg">
              Our support team is here to help you 24/7
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <Phone className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Call Us</h3>
              <p className="text-green-100">+91 1800-123-4567</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <Mail className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Email Us</h3>
              <p className="text-green-100">support@pawvaidya.com</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <MessageCircle className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
              <p className="text-green-100">Chat with our team</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
