import express from 'express';
import { addDoctor, allDoctors, loginAdmin, appointmenetsAdmin, Appointmentcancel, admindashboard, allUsers, deleteUser, editUser, deleteDoctor, makeAllDoctorsAvailable, getUserDetailsWithPassword, getDoctorDetailsWithPassword, getAllUsersWithPasswords, getAllDoctorsWithPasswords, getActivityLogs, getRealtimeActivityLogs, sendVerificationEmailToUser, createAdminMessage, getAllAdminMessages, updateAdminMessage, deleteAdminMessage, getBlogReports, updateBlogReportStatus, banFromBlogging, unbanFromBlogging, getUnbanRequests, handleUnbanRequest, deleteBlogReport, bulkDeleteBlogReports } from '../controllers/adminController.js';
import { initializeAdmin, getAdminProfile, updateAdminProfile, updateAdminPassword } from '../controllers/adminProfileController.js';
import upload from '../middleware/multer.js';
import authAdmin from '../middleware/authAdmin.js';
import changeavailablity from '../controllers/doctorContorller.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availablity', authAdmin, changeavailablity)
adminRouter.post('/make-all-doctors-available', authAdmin, makeAllDoctorsAvailable)
adminRouter.get('/appointments', authAdmin, appointmenetsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, Appointmentcancel)
adminRouter.get('/dashboard', authAdmin, admindashboard)
adminRouter.get('/all-users', authAdmin, allUsers)
adminRouter.delete('/users/:userId', authAdmin, deleteUser);
adminRouter.put('/users/:userId', authAdmin, upload.single('image'), editUser);
adminRouter.delete('/doctors/:doctorId', authAdmin, deleteDoctor);

// New endpoints for detailed user/doctor information with passwords and stats
adminRouter.get('/users-with-passwords', authAdmin, getAllUsersWithPasswords);
adminRouter.get('/doctors-with-passwords', authAdmin, getAllDoctorsWithPasswords);
adminRouter.get('/user-details/:userId', authAdmin, getUserDetailsWithPassword);
adminRouter.get('/doctor-details/:doctorId', authAdmin, getDoctorDetailsWithPassword);
adminRouter.get('/activity-logs', authAdmin, getActivityLogs);
adminRouter.get('/realtime-activity-logs', authAdmin, getRealtimeActivityLogs);
adminRouter.post('/send-verification-email', authAdmin, sendVerificationEmailToUser);

// Admin messages routes
adminRouter.post('/messages', authAdmin, upload.array('attachments', 5), createAdminMessage);
adminRouter.get('/messages', authAdmin, getAllAdminMessages);
adminRouter.put('/messages/:messageId', authAdmin, upload.array('attachments', 5), updateAdminMessage);
adminRouter.delete('/messages/:messageId', authAdmin, deleteAdminMessage);

// Blog reports routes
adminRouter.get('/blog-reports', authAdmin, getBlogReports);
adminRouter.post('/blog-reports/update-status', authAdmin, updateBlogReportStatus);
adminRouter.delete('/blog-reports/:reportId', authAdmin, deleteBlogReport);
adminRouter.post('/blog-reports/bulk-delete', authAdmin, bulkDeleteBlogReports);

// Blog ban management routes
adminRouter.post('/blog-ban', authAdmin, banFromBlogging);
adminRouter.post('/blog-unban', authAdmin, unbanFromBlogging);
adminRouter.get('/unban-requests', authAdmin, getUnbanRequests);
adminRouter.post('/unban-requests/handle', authAdmin, handleUnbanRequest);

// Admin profile management routes
adminRouter.post('/initialize', initializeAdmin); // One-time migration (no auth required)
adminRouter.get('/profile', authAdmin, getAdminProfile);
adminRouter.put('/profile', authAdmin, upload.single('image'), updateAdminProfile);
adminRouter.put('/password', authAdmin, updateAdminPassword);

export default adminRouter
