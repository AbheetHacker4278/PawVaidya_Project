import express from 'express';
import {appointmentCancel, appointmentComplete, appointmentsDoctor, doctorDashboard, doctorProfile, doctorslist, logindoctor, updateDoctorProfile, logoutdoctor, getDoctorMessages, markDoctorMessageAsRead, getDoctorById, updateDoctorLocation, createReminder, getDoctorReminders, updateReminder, deleteReminder, getDailyEarnings}  from '../controllers/doctorContorller.js';
import { createDoctorBlog, getDoctorBlogs, updateDoctorBlog, deleteDoctorBlog, getAllBlogsForDoctor, toggleLikeBlog, addCommentToBlog, incrementBlogView, getBlogDetails } from '../controllers/doctorBlogController.js';
import { authDoctor } from '../middleware/authDoctor.js';
import upload from '../middleware/multer.js';

export const doctorrouter = express.Router()

doctorrouter.get('/list' , doctorslist)
doctorrouter.post('/login' , logindoctor)
doctorrouter.post('/logout' , authDoctor, logoutdoctor)
doctorrouter.get('/appointments' , authDoctor , appointmentsDoctor)
doctorrouter.post('/complete-appointment' , authDoctor , appointmentComplete)
doctorrouter.post('/cancel-appointment' , authDoctor , appointmentCancel)
doctorrouter.get('/dashboard' , authDoctor , doctorDashboard) 
doctorrouter.get('/profile' , authDoctor , doctorProfile) 
doctorrouter.post('/update-profile' , upload.single('image') , authDoctor , updateDoctorProfile)
doctorrouter.post('/location' , authDoctor , updateDoctorLocation)

// Doctor messages routes
doctorrouter.post('/messages', authDoctor, getDoctorMessages)
doctorrouter.post('/messages/read', authDoctor, markDoctorMessageAsRead)

// Get doctor by ID (for admin)
doctorrouter.get('/profile/:doctorId', getDoctorById)

// Doctor blog routes
doctorrouter.post('/blogs/create', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 2 }]), authDoctor, createDoctorBlog)
doctorrouter.post('/blogs/my-blogs', authDoctor, getDoctorBlogs)
doctorrouter.post('/blogs/update', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 2 }]), authDoctor, updateDoctorBlog)
doctorrouter.post('/blogs/delete', authDoctor, deleteDoctorBlog)
doctorrouter.get('/blogs/community', authDoctor, getAllBlogsForDoctor)
doctorrouter.post('/blogs/like', authDoctor, toggleLikeBlog)
doctorrouter.post('/blogs/comment', authDoctor, addCommentToBlog)
doctorrouter.post('/blogs/view', authDoctor, incrementBlogView)
doctorrouter.get('/blogs/:blogId', authDoctor, getBlogDetails)

// Reminder routes
doctorrouter.post('/reminders/create', authDoctor, createReminder)
doctorrouter.post('/reminders', authDoctor, getDoctorReminders)
doctorrouter.post('/reminders/update', authDoctor, updateReminder)
doctorrouter.post('/reminders/delete', authDoctor, deleteReminder)

// Calendar earnings route
doctorrouter.post('/earnings/daily', authDoctor, getDailyEarnings)

export default doctorrouter