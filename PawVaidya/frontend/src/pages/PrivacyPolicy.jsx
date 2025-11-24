import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  // Build privacy policy questions and answers from translations
  const privacypolicydata = [
    {
      question: t('privacyPolicy.q1'),
      answers: [
        t('privacyPolicy.a1_1'),
        t('privacyPolicy.a1_2'),
        t('privacyPolicy.a1_3'),
        t('privacyPolicy.a1_4'),
      ]
    },
    {
      question: t('privacyPolicy.q2'),
      answers: [
        t('privacyPolicy.a2_1'),
        t('privacyPolicy.a2_2')
      ]
    },
    {
      question: t('privacyPolicy.q3'),
      answers: [
        t('privacyPolicy.a3_1'),
        t('privacyPolicy.a3_2'),
      ]
    },
    {
      question: t('privacyPolicy.q4'),
      answers: [
        t('privacyPolicy.a4_1'),
        t('privacyPolicy.a4_2')
      ]
    },
    {
      question: t('privacyPolicy.q5'),
      answers: [
        t('privacyPolicy.a5_1'),
        t('privacyPolicy.a5_2')
      ]
    },
    {
      question: t('privacyPolicy.q6'),
      answers: [
        t('privacyPolicy.a6_1'),
        t('privacyPolicy.a6_2'),
        t('privacyPolicy.a6_3')
      ]
    },
    {
      question: t('privacyPolicy.q7'),
      answers: [
        t('privacyPolicy.a7_1')
      ]
    },
    {
      question: t('privacyPolicy.q8'),
      answers: [
        t('privacyPolicy.a8_1'),
        t('privacyPolicy.a8_2')
      ]
    },
    {
      question: t('privacyPolicy.q9'),
      answers: [
        t('privacyPolicy.a9_1'),
        t('privacyPolicy.a9_2')
      ]
    },
    {
      question: t('privacyPolicy.q10'),
      answers: [
        t('privacyPolicy.a10_1'),
        t('privacyPolicy.a10_2')
      ]
    }
  ];

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-600 mb-4">
            {t('privacyPolicy.title')} 🦥
          </h1>
          <p className="text-lg text-gray-600">
            {t('privacyPolicy.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {privacypolicydata.map((faq, index) => (
            <div key={index} className="mb-4 border-b border-gray-200">
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full flex justify-between items-center text-left py-4 text-gray-800 font-semibold focus:outline-none"
              >
                {faq.question}
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-green-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-green-400" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <ul className="list-disc list-inside pl-5 text-gray-600">
                  {faq.answers.map((answer, i) => (
                    <li key={i} className="mb-2">
                      {answer}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t('privacyPolicy.cantFind')}{' '}
            <a
              href="/contact"
              className="text-green-600 hover:text-green-500 font-medium"
            >
              {t('privacyPolicy.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
