import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import RunningDogLoader from '../components/RunningDogLoader';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  PlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

const CommunityBlogs = () => {
  const { t, i18n } = useTranslation();
  const { token, userdata, backendurl } = useContext(AppContext);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [isVisible, setIsVisible] = useState(false);
  const [translationCache, setTranslationCache] = useState({});
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [page, sortBy]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendurl}/api/user/blogs?page=${page}&limit=10&sort=${sortBy}`
      );
      if (data.success) {
        setBlogs(data.blogs);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  // Translation function using Google Gemini
  const translateText = async (text, targetLang) => {
    if (!text || targetLang === 'en') return text;

    const cacheKey = `${text}_${targetLang}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDJXu-zXCRi4gWLKPwGNKgDqhvfQfxgfHU');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const langMap = {
        'hi': 'Hindi',
        'ta': 'Tamil',
        'te': 'Telugu'
      };

      const prompt = `Translate the following text to ${langMap[targetLang] || targetLang}. Only return the translation, nothing else:\n\n${text}`;
      const result = await model.generateContent(prompt);
      const translation = result.response.text().trim();

      setTranslationCache(prev => ({ ...prev, [cacheKey]: translation }));
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  };

  // Translate blogs when language changes
  useEffect(() => {
    const translateBlogs = async () => {
      if (i18n.language === 'en') {
        // Reset to original content when switching to English
        return;
      }

      if (blogs.length === 0) return;

      setTranslating(true);
      try {
        // Create a new array with translations
        const updatedBlogs = [];
        for (const blog of blogs) {
          // Check if already translated for this language
          if (blog.translatedLang === i18n.language && blog.translatedTitle) {
            updatedBlogs.push(blog);
            continue;
          }

          const translatedTitle = await translateText(blog.title, i18n.language);
          const translatedContent = await translateText(blog.content, i18n.language);
          updatedBlogs.push({
            ...blog,
            translatedTitle,
            translatedContent,
            translatedLang: i18n.language
          });
        }
        setBlogs(updatedBlogs);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setTranslating(false);
      }
    };

    translateBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleLike = async (e, blogId, currentIsLiked) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error(t('blogs.pleaseLoginToLike'));
      return;
    }

    // Check if user is banned
    if (userdata.isBanned) {
      toast.error(t('blogs.accountBannedCannotLike'));
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/blogs/${blogId}/like`,
        { userId: userdata.id },
        { headers: { token } }
      );

      if (data.success) {
        setBlogs(blogs.map(blog => {
          if (blog._id === blogId) {
            if (data.liked) {
              const newLikes = [...(blog.likes || []), { userId: userdata.id, likedAt: new Date() }];
              return { ...blog, likes: newLikes };
            } else {
              const newLikes = (blog.likes || []).filter(like => like.userId !== userdata.id);
              return { ...blog, likes: newLikes };
            }
          }
          return blog;
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('blogs.failedToLike'));
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm(t('blogs.confirmDelete'))) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${backendurl}/api/user/blogs/${blogId}`,
        {
          headers: { token },
          data: { userId: userdata.id }
        }
      );

      if (data.success) {
        toast.success(t('blogs.postDeleted'));
        fetchBlogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('blogs.failedToDelete'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen py-8 transition-colors duration-500" style={{ backgroundColor: '#f2e4c7' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with fade-in animation */}
        <div
          className={`flex justify-between items-center mb-8 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              {t('blogs.title')}
            </h1>
            <p className="text-gray-600">{t('blogs.subtitle')}</p>
          </div>
          {token && userdata && !userdata.isBanned && (
            <button
              onClick={() => navigate('/create-blog')}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 
                       transform hover:scale-105 hover:shadow-xl active:scale-95 
                       transition-all duration-200 shadow-lg"
            >
              <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
              {t('blogs.createPost')}
            </button>
          )}
        </div>

        {/* Sort Options with slide animation */}
        <div
          className={`flex gap-4 mb-6 transform transition-all duration-700 delay-100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
            }`}
        >
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                     transition-all duration-200 hover:border-green-400 hover:shadow-md cursor-pointer
                     bg-white shadow-sm"
          >
            <option value="newest">{t('blogs.newestFirst')}</option>
            <option value="oldest">{t('blogs.oldestFirst')}</option>
            <option value="most_liked">{t('blogs.mostLiked')}</option>
          </select>
        </div>

        {/* Loading State with pulse animation */}
        {loading || translating ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="flex justify-center items-center h-64">
              <RunningDogLoader />
            </div>
            <p className="mt-4 text-gray-600 animate-pulse">
              {translating ? t('blogs.translating') : t('common.loading')}
            </p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg animate-fade-in-up">
            <p className="text-gray-600 text-lg">{t('blogs.noBlogs')}</p>
          </div>
        ) : (
          <>
            {/* Blog Cards with staggered animation */}
            <div className="space-y-6">
              {blogs.map((blog, index) => {
                const isLiked = token && userdata && blog.likes?.some(like => like.userId === userdata.id);
                const isOwner = token && userdata && blog.userId === userdata.id;

                return (
                  <div
                    key={blog._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden
                             transform hover:-translate-y-1 animate-fade-in-up border border-gray-100"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {/* Blog Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={blog.userImage || 'https://via.placeholder.com/50'}
                            alt={blog.userName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-green-100 
                                     transition-all duration-300 hover:ring-4 hover:ring-green-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors duration-200">
                                {blog.userName}
                              </h3>
                              {blog.authorType === 'doctor' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {t('blogs.doctor')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {blog.authorType === 'doctor' && blog.authorSpeciality ? (
                                <span className="text-blue-600 font-medium">{blog.authorSpeciality} • </span>
                              ) : null}
                              {formatDate(blog.createdAt)}
                            </p>
                          </div>
                        </div>
                        {isOwner && !userdata.isBanned && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/edit-blog/${blog._id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200
                                       transform hover:scale-110 active:scale-95 hover:shadow-md"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200
                                       transform hover:scale-110 active:scale-95 hover:shadow-md"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Blog Title */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-green-700 transition-colors duration-200">
                        {blog.translatedTitle || blog.title}
                      </h2>

                      {/* Blog Content */}
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
                        {blog.translatedContent || blog.content}
                      </p>

                      {/* Tags */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm
                                       transform hover:scale-105 hover:bg-green-200 transition-all duration-200
                                       cursor-pointer shadow-sm hover:shadow-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Images */}
                      {blog.images && blog.images.length > 0 && (
                        <div className={`grid gap-3 mb-4 ${blog.images.length === 1 ? 'grid-cols-1' :
                          blog.images.length === 2 ? 'grid-cols-2' :
                            'grid-cols-3'
                          }`}>
                          {blog.images.map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300
                                       transform hover:scale-105 cursor-pointer group"
                              onClick={() => window.open(image, '_blank')}
                            >
                              <img
                                src={image}
                                alt={`Blog image ${imgIndex + 1}`}
                                className="w-full h-64 object-cover transition-transform duration-500 
                                         group-hover:scale-110"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Videos */}
                      {blog.videos && blog.videos.length > 0 && (
                        <div className="space-y-4 mb-4">
                          {blog.videos.map((video, vidIndex) => (
                            <div
                              key={vidIndex}
                              className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                            >
                              <video
                                src={video}
                                controls
                                className="w-full"
                              >
                                {t('blogs.videoNotSupported')}
                              </video>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Blog Actions */}
                      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={(e) => handleLike(e, blog._id, isLiked)}
                          className={`flex items-center gap-2 ${isLiked ? 'text-red-600' : 'text-gray-600'
                            } hover:text-red-600 transition-all duration-200 transform hover:scale-110 active:scale-95
                          group`}
                        >
                          {isLiked ? (
                            <HeartSolidIcon className="w-6 h-6 animate-heart-beat" />
                          ) : (
                            <HeartIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                          )}
                          <span className="font-semibold">{blog.likes?.length || 0}</span>
                        </button>
                        <button
                          onClick={() => navigate(`/blog/${blog._id}`)}
                          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all duration-200
                                   transform hover:scale-110 active:scale-95 group"
                        >
                          <ChatBubbleLeftIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-semibold">{blog.comments?.length || 0}</span>
                        </button>
                        <div className="flex items-center gap-2 text-gray-600 group">
                          <EyeIcon className="w-6 h-6 group-hover:text-blue-600 transition-colors duration-200" />
                          <span className="font-semibold">{blog.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination with fade animation */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 animate-fade-in">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed 
                           hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-105 
                           active:scale-95 bg-white/50 shadow-sm font-medium"
                >
                  {t('common.previous')}
                </button>
                <span className="px-6 py-2 text-gray-700 font-semibold bg-white rounded-lg shadow-sm">
                  {t('common.page')} {page} {t('common.of')} {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed 
                           hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-105 
                           active:scale-95 bg-white/50 shadow-sm font-medium"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heart-beat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.2);
          }
          50% {
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-heart-beat {
          animation: heart-beat 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CommunityBlogs;
