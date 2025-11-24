import validator from 'validator';
import bcryptjs from 'bcryptjs';
import argon2 from "argon2";
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import activityLogModel from '../models/activityLogModel.js';
import { logActivity } from '../utils/activityLogger.js';
import { transporter } from '../config/nodemailer.js';
import VERIFICATION_EMAIL_TEMPLATE from '../mailservice/emailtemplate2.js';
import adminMessageModel from '../models/adminMessageModel.js';
import adminModel from '../models/adminModel.js';

// API for adding a doctor
export const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, docphone, address, full_address } = req.body;
        const imageFile = req.file;

        // Validate required fields
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !docphone || !address || !full_address) {
            return res.json({
                success: false,
                message: "Missing required Fields",
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Invalid email format",
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Use a strong password",
            });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await argon2.hash(password, salt);

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
        const imageUrl = imageUpload.secure_url;

        // Create doctor data
        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            plainPassword: password, // Store original password for admin access
            speciality,
            degree,
            experience,
            about,
            fees,
            docphone,
            address: JSON.parse(address),
            full_address,
            date: Date.now(),
        };

        // Save doctor to the database
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        // Send a success response
        res.status(200).json({
            success: true,
            message: "Doctor added successfully",
            data: {
                name,
                email,
                hashedPassword,
                speciality,
                degree,
                experience,
                about,
                fees,
                docphone,
                address,
                full_address,
            },
        });
    } catch (error) {
        console.error("Error adding doctor:", error.message);

        // Send an error response
        res.status(500).json({
            success: false,
            message: "Failed to add doctor",
            error: error.message,
        });
    }
};


// API to delete a doctor
export const makeAllDoctorsAvailable = async (req, res) => {
    try {
        // Update all doctors to set available = true
        const result = await doctorModel.updateMany(
            {},
            { $set: { available: true } }
        );

        return res.json({
            success: true,
            message: `Successfully made ${result.modifiedCount} doctor(s) available`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error making all doctors available:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const deleteDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Check if doctor exists
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Check for associated appointments
        const doctorAppointments = await appointmentModel.find({ docId: doctorId });

        // Delete associated appointments
        if (doctorAppointments.length > 0) {
            await appointmentModel.deleteMany({ docId: doctorId });
        }

        // Delete the doctor's image from Cloudinary if exists
        if (doctor.image && doctor.image.includes('cloudinary')) {
            const publicId = doctor.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        // Delete the doctor
        await doctorModel.findByIdAndDelete(doctorId);

        res.json({
            success: true,
            message: "Doctor deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting doctor:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete doctor",
            error: error.message
        });
    }
};




// API for admin login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate admin credentials
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({
                success: true,
                token,
            });
        } else {
            res.json({
                success: false,
                message: "Invalid email or password",
            });
        }
    } catch (error) {
        console.error("Error logging in admin:", error.message);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
export const allUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password -resetOtpExpireAt -verifyOtpExpiredAt -verifyOtpVerified -verifyOtp -resetOtp');
        res.json({ success: true, users })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// API to delete a user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check for associated appointments
        const userAppointments = await appointmentModel.find({ userId });

        // Delete associated appointments
        if (userAppointments.length > 0) {
            await appointmentModel.deleteMany({ userId });
        }

        // Delete the user
        await userModel.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message
        });
    }
};

// API to edit a user
export const editUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Validate email if it's being updated
        if (updateData.email && !validator.isEmail(updateData.email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Handle password update if provided
        if (updateData.password) {
            // Validate password strength
            if (updateData.password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 8 characters long"
                });
            }

            // Store plain password for admin access
            const plainPassword = updateData.password;

            // Hash the new password
            const salt = await bcryptjs.genSalt(10);
            updateData.password = await argon2.hash(plainPassword, salt);
            updateData.plainPassword = plainPassword; // Store original password
        }

        // Handle image upload if provide
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
            updateData.image = imageUpload.secure_url;
        }

        // Update user in database
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password -resetOtpExpireAt -verifyOtpExpiredAt -verifyOtpVerified -verifyOtp -resetOtp');

        res.json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message
        });
    }
};


// API to get dashboard data for admin panel
export const appointmenetsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({
            success: true,
            appointments
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//APi for cancle appointment
export const Appointmentcancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const admindashboard = async (req, res) => {
    try {
        // Fetch counts directly
        const doctorsCount = await doctorModel.countDocuments({});
        const usersCount = await userModel.countDocuments({});
        const appointmentsCount = await appointmentModel.countDocuments({});
        const canceledAppointmentCount = await appointmentModel.countDocuments({ cancelled: true });
        const completedAppointmentCount = await appointmentModel.countDocuments({ isCompleted: true });

        // Fetch latest 5 appointments
        const latestAppointments = await appointmentModel
            .find({})
            .sort({ date: -1 })
            .limit(5);

        // Fetch latest 5 cancelled appointments
        const cancelledAppointments = await appointmentModel
            .find({ cancelled: true })
            .sort({ date: -1 })
            .limit(5);

        // Fetch latest 5 completed appointments
        const completedAppointments = await appointmentModel
            .find({ isCompleted: true })
            .sort({ date: -1 })
            .limit(5);

        // Aggregate appointments per user
        const userAppointments = await appointmentModel.aggregate([
            {
                $group: {
                    _id: "$userId", // Group by user ID
                    totalAppointments: { $sum: 1 }, // Count appointments
                },
            },
            {
                $addFields: {
                    userObjectId: { $toObjectId: "$_id" }, // Convert userId to ObjectId
                },
            },
            {
                $lookup: {
                    from: "users", // Name of the users collection
                    localField: "userObjectId", // Match converted ObjectId to `_id` in users
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
            {
                $unwind: "$userInfo", // Flatten the userInfo array
            },
            {
                $project: {
                    userId: "$userInfo._id",
                    name: "$userInfo.name",
                    email: "$userInfo.email",
                    totalAppointments: 1,
                },
            },
        ]);

        // Prepare dashboard data
        const dashdata = {
            doctors: doctorsCount,
            appointments: appointmentsCount,
            patients: usersCount,
            canceledAppointmentCount,
            completedAppointmentCount,
            latestAppointments,
            cancelledAppointments,
            completedAppointments,
            userAppointments, // Include the user appointment stats
        };

        res.json({ success: true, dashdata });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Server Error. Please try again later." });
    }
};

// Get user details with password and statistics
export const getUserDetailsWithPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        // Format total session time
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            if (hours > 0) {
                return `${hours}h ${minutes}m ${secs}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${secs}s`;
            } else {
                return `${secs}s`;
            }
        };

        const userData = {
            ...user.toObject(),
            password: user.plainPassword || user.password, // Include plain password for admin (fallback to hashed if not available)
            lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
            lastLogout: user.lastLogout ? new Date(user.lastLogout).toISOString() : null,
            totalSessionTime: user.totalSessionTime || 0,
            totalSessionTimeFormatted: formatTime(user.totalSessionTime || 0),
            currentSessionStart: user.currentSessionStart ? new Date(user.currentSessionStart).toISOString() : null,
            isOnline: user.currentSessionStart ? true : false
        };

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Error getting user details:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get doctor details with password and statistics
export const getDoctorDetailsWithPassword = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await doctorModel.findById(doctorId);

        if (!doctor) {
            return res.json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Format total session time
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            if (hours > 0) {
                return `${hours}h ${minutes}m ${secs}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${secs}s`;
            } else {
                return `${secs}s`;
            }
        };

        const doctorData = {
            ...doctor.toObject(),
            password: doctor.plainPassword || doctor.password, // Include plain password for admin (fallback to hashed if not available)
            lastLogin: doctor.lastLogin ? new Date(doctor.lastLogin).toISOString() : null,
            lastLogout: doctor.lastLogout ? new Date(doctor.lastLogout).toISOString() : null,
            totalSessionTime: doctor.totalSessionTime || 0,
            totalSessionTimeFormatted: formatTime(doctor.totalSessionTime || 0),
            currentSessionStart: doctor.currentSessionStart ? new Date(doctor.currentSessionStart).toISOString() : null,
            isOnline: doctor.currentSessionStart ? true : false
        };

        res.json({
            success: true,
            doctor: doctorData
        });
    } catch (error) {
        console.error('Error getting doctor details:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get all users with passwords and statistics
export const getAllUsersWithPasswords = async (req, res) => {
    try {
        const users = await userModel.find({});

        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            if (hours > 0) {
                return `${hours}h ${minutes}m ${secs}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${secs}s`;
            } else {
                return `${secs}s`;
            }
        };

        const usersWithStats = users.map(user => ({
            ...user.toObject(),
            password: user.plainPassword || user.password, // Include plain password for admin (fallback to hashed if not available)
            lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
            lastLogout: user.lastLogout ? new Date(user.lastLogout).toISOString() : null,
            totalSessionTime: user.totalSessionTime || 0,
            totalSessionTimeFormatted: formatTime(user.totalSessionTime || 0),
            currentSessionStart: user.currentSessionStart ? new Date(user.currentSessionStart).toISOString() : null,
            isOnline: user.currentSessionStart ? true : false
        }));

        res.json({
            success: true,
            users: usersWithStats
        });
    } catch (error) {
        console.error('Error getting users with passwords:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get all doctors with passwords and statistics
export const getAllDoctorsWithPasswords = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});

        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            if (hours > 0) {
                return `${hours}h ${minutes}m ${secs}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${secs}s`;
            } else {
                return `${secs}s`;
            }
        };

        const doctorsWithStats = doctors.map(doctor => ({
            ...doctor.toObject(),
            password: doctor.plainPassword || doctor.password, // Include plain password for admin (fallback to hashed if not available)
            lastLogin: doctor.lastLogin ? new Date(doctor.lastLogin).toISOString() : null,
            lastLogout: doctor.lastLogout ? new Date(doctor.lastLogout).toISOString() : null,
            totalSessionTime: doctor.totalSessionTime || 0,
            totalSessionTimeFormatted: formatTime(doctor.totalSessionTime || 0),
            currentSessionStart: doctor.currentSessionStart ? new Date(doctor.currentSessionStart).toISOString() : null,
            isOnline: doctor.currentSessionStart ? true : false
        }));

        res.json({
            success: true,
            doctors: doctorsWithStats
        });
    } catch (error) {
        console.error('Error getting doctors with passwords:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get activity logs for a user or doctor
export const getActivityLogs = async (req, res) => {
    try {
        const { userId, userType, limit = 100, skip = 0 } = req.query;

        let query = {};
        if (userId) {
            query.userId = userId;
        }
        if (userType) {
            query.userType = userType;
        }

        const logs = await activityLogModel
            .find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const totalLogs = await activityLogModel.countDocuments(query);

        res.json({
            success: true,
            logs,
            total: totalLogs,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });
    } catch (error) {
        console.error('Error getting activity logs:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get real-time activity logs (last N minutes)
export const getRealtimeActivityLogs = async (req, res) => {
    try {
        const { minutes = 5 } = req.query;
        const timeAgo = new Date(Date.now() - minutes * 60 * 1000);

        const logs = await activityLogModel
            .find({
                timestamp: { $gte: timeAgo }
            })
            .sort({ timestamp: -1 })
            .limit(200);

        res.json({
            success: true,
            logs,
            timeRange: `Last ${minutes} minutes`
        });
    } catch (error) {
        console.error('Error getting real-time activity logs:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Send verification email to user (Admin action)
export const sendVerificationEmailToUser = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isAccountverified) {
            return res.json({
                success: false,
                message: 'User account is already verified'
            });
        }

        // Generate new OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry

        await user.save();

        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Email Verification Request - PawVaidya',
            html: VERIFICATION_EMAIL_TEMPLATE.replace('{otp}', otp)
                .replace('Hello,', `Hello ${user.name || 'User'},`)
        };

        await transporter.sendMail(mailOptions);

        // Log activity
        await logActivity(
            userId.toString(),
            'user',
            'email_verification_sent',
            `Admin sent email verification request to user: ${user.email}`,
            req,
            { email: user.email, name: user.name, adminAction: true }
        );

        res.json({
            success: true,
            message: `Verification email sent successfully to ${user.email}`
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.json({
            success: false,
            message: error.message || 'Failed to send verification email'
        });
    }
};

// Create admin message
export const createAdminMessage = async (req, res) => {
    try {
        const { title, message, targetType, priority, expiresAt } = req.body;
        let { targetIds } = req.body;

        if (!title || !message || !targetType) {
            return res.json({
                success: false,
                message: 'Title, message, and target type are required'
            });
        }

        // Handle file attachments
        const attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Upload to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto', // Automatically detect resource type
                    folder: 'admin_messages'
                });

                // Determine file type
                const fileType = uploadResult.resource_type === 'video' ? 'video' : 'image';

                attachments.push({
                    url: uploadResult.secure_url,
                    type: fileType,
                    filename: file.originalname
                });
            }
        }

        // Parse targetIds if provided as JSON string
        let parsedTargetIds = [];
        if (Array.isArray(targetIds)) {
            parsedTargetIds = targetIds;
        } else if (typeof targetIds === 'string' && targetIds.trim()) {
            try {
                const tmp = JSON.parse(targetIds);
                if (Array.isArray(tmp)) parsedTargetIds = tmp;
            } catch (e) { }
        }

        const messageData = {
            title,
            message,
            targetType,
            targetIds: parsedTargetIds,
            priority: priority || 'normal',
            expiresAt: expiresAt || null,
            attachments
        };

        const newMessage = new adminMessageModel(messageData);
        await newMessage.save();

        res.json({
            success: true,
            message: 'Admin message created successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error creating admin message:', error);
        res.json({
            success: false,
            message: error.message || 'Failed to create admin message'
        });
    }
};

// Get all admin messages
export const getAllAdminMessages = async (req, res) => {
    try {
        const messages = await adminMessageModel
            .find({})
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error getting admin messages:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Update admin message
export const updateAdminMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const updateData = req.body;

        // Handle new file attachments if provided
        if (req.files && req.files.length > 0) {
            const attachments = [];
            for (const file of req.files) {
                // Upload to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                    folder: 'admin_messages'
                });

                const fileType = uploadResult.resource_type === 'video' ? 'video' : 'image';

                attachments.push({
                    url: uploadResult.secure_url,
                    type: fileType,
                    filename: file.originalname
                });
            }

            // Get existing message to merge attachments
            const existingMessage = await adminMessageModel.findById(messageId);
            if (existingMessage && existingMessage.attachments) {
                updateData.attachments = [...existingMessage.attachments, ...attachments];
            } else {
                updateData.attachments = attachments;
            }
        }

        // Normalize targetIds if present
        if (updateData.targetIds && typeof updateData.targetIds === 'string') {
            try {
                const tmp = JSON.parse(updateData.targetIds);
                if (Array.isArray(tmp)) updateData.targetIds = tmp;
            } catch (e) { }
        }

        const updatedMessage = await adminMessageModel.findByIdAndUpdate(
            messageId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedMessage) {
            return res.json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message updated successfully',
            data: updatedMessage
        });
    } catch (error) {
        console.error('Error updating admin message:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Delete admin message
export const deleteAdminMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const deletedMessage = await adminMessageModel.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin message:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get all blog reports
export const getBlogReports = async (req, res) => {
    try {
        const { status } = req.query;

        let query = { activityType: 'report_blog' };
        if (status) {
            query.status = status;
        }

        const reports = await activityLogModel.find(query)
            .sort({ timestamp: -1 })
            .limit(100);

        // Enrich reports with author ban status
        const enrichedReports = await Promise.all(reports.map(async (report) => {
            const reportObj = report.toObject();
            if (reportObj.metadata?.blogAuthorId && reportObj.metadata?.blogAuthorType) {
                const Model = reportObj.metadata.blogAuthorType === 'user' ? userModel : doctorModel;
                const author = await Model.findById(reportObj.metadata.blogAuthorId)
                    .select('isBlogBanned blogBanType blogBanReason');

                if (author) {
                    reportObj.metadata.authorBanStatus = {
                        isBanned: author.isBlogBanned || false,
                        banType: author.blogBanType || null,
                        banReason: author.blogBanReason || null
                    };
                }
            }
            return reportObj;
        }));

        // Get statistics
        const totalReports = await activityLogModel.countDocuments({ activityType: 'report_blog' });
        const pendingReports = await activityLogModel.countDocuments({ activityType: 'report_blog', status: 'pending' });
        const resolvedReports = await activityLogModel.countDocuments({ activityType: 'report_blog', status: 'resolved' });

        return res.json({
            success: true,
            reports: enrichedReports,
            statistics: {
                total: totalReports,
                pending: pendingReports,
                resolved: resolvedReports
            }
        });
    } catch (error) {
        console.error('Error fetching blog reports:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Update blog report status
export const updateBlogReportStatus = async (req, res) => {
    try {
        const { reportId, status } = req.body;

        if (!['pending', 'resolved', 'dismissed'].includes(status)) {
            return res.json({
                success: false,
                message: 'Invalid status'
            });
        }

        const report = await activityLogModel.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        );

        if (!report) {
            return res.json({
                success: false,
                message: 'Report not found'
            });
        }

        return res.json({
            success: true,
            message: 'Report status updated',
            report
        });
    } catch (error) {
        console.error('Error updating report status:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Ban user/doctor from blogging
export const banFromBlogging = async (req, res) => {
    try {
        const { userId, userType, banType, reason, duration } = req.body;

        if (!['user', 'doctor'].includes(userType)) {
            return res.json({
                success: false,
                message: 'Invalid user type'
            });
        }

        if (!['temporary', 'permanent'].includes(banType)) {
            return res.json({
                success: false,
                message: 'Invalid ban type'
            });
        }

        const Model = userType === 'user' ? userModel : doctorModel;
        const account = await Model.findById(userId);

        if (!account) {
            return res.json({
                success: false,
                message: `${userType} not found`
            });
        }

        const banData = {
            isBlogBanned: true,
            blogBanType: banType,
            blogBanReason: reason,
            blogBannedAt: new Date()
        };

        if (banType === 'temporary' && duration) {
            banData.blogBanExpiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
        }

        await Model.findByIdAndUpdate(userId, banData);

        // Log the ban action
        await logActivity(
            userId,
            userType,
            'blog_ban',
            `${userType} banned from blogging: ${banType}`,
            req,
            { reason, banType, duration }
        );

        return res.json({
            success: true,
            message: `${userType} banned from blogging successfully`
        });
    } catch (error) {
        console.error('Error banning from blogging:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Unban user/doctor from blogging
export const unbanFromBlogging = async (req, res) => {
    try {
        const { userId, userType } = req.body;

        if (!['user', 'doctor'].includes(userType)) {
            return res.json({
                success: false,
                message: 'Invalid user type'
            });
        }

        const Model = userType === 'user' ? userModel : doctorModel;

        await Model.findByIdAndUpdate(userId, {
            isBlogBanned: false,
            blogBanType: null,
            blogBanReason: '',
            blogBannedAt: null,
            blogBanExpiresAt: null
        });

        // Log the unban action
        await logActivity(
            userId,
            userType,
            'blog_unban',
            `${userType} unbanned from blogging by admin`,
            req,
            {}
        );

        return res.json({
            success: true,
            message: `${userType} unbanned from blogging successfully`
        });
    } catch (error) {
        console.error('Error unbanning from blogging:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Get unban requests
export const getUnbanRequests = async (req, res) => {
    try {
        const users = await userModel.find({
            'blogUnbanRequests.status': 'pending'
        }).select('name email blogUnbanRequests isBlogBanned blogBanType');

        const doctors = await doctorModel.find({
            'blogUnbanRequests.status': 'pending'
        }).select('name email blogUnbanRequests isBlogBanned blogBanType');

        const requests = [
            ...users.map(u => ({ ...u.toObject(), userType: 'user' })),
            ...doctors.map(d => ({ ...d.toObject(), userType: 'doctor' }))
        ];

        return res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Error fetching unban requests:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Handle unban request (approve/reject)
export const handleUnbanRequest = async (req, res) => {
    try {
        const { userId, userType, requestId, action } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.json({
                success: false,
                message: 'Invalid action'
            });
        }

        const Model = userType === 'user' ? userModel : doctorModel;
        const account = await Model.findById(userId);

        if (!account) {
            return res.json({
                success: false,
                message: `${userType} not found`
            });
        }

        const request = account.blogUnbanRequests.id(requestId);
        if (!request) {
            return res.json({
                success: false,
                message: 'Request not found'
            });
        }

        request.status = action === 'approve' ? 'approved' : 'rejected';

        if (action === 'approve') {
            account.isBlogBanned = false;
            account.blogBanType = null;
            account.blogBanReason = '';
            account.blogBannedAt = null;
            account.blogBanExpiresAt = null;
        }

        await account.save();

        // Log the action
        await logActivity(
            userId,
            userType,
            `unban_request_${action}d`,
            `Unban request ${action}d by admin`,
            req,
            { requestId, action }
        );

        return res.json({
            success: true,
            message: `Unban request ${action}d successfully`
        });
    } catch (error) {
        console.error('Error handling unban request:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Delete blog report
export const deleteBlogReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await activityLogModel.findByIdAndDelete(reportId);

        if (!report) {
            return res.json({
                success: false,
                message: 'Report not found'
            });
        }

        return res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog report:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Bulk delete blog reports
export const bulkDeleteBlogReports = async (req, res) => {
    try {
        const { reportIds } = req.body;

        if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
            return res.json({
                success: false,
                message: 'No report IDs provided'
            });
        }

        const result = await activityLogModel.deleteMany({
            _id: { $in: reportIds },
            activityType: 'report_blog'
        });

        return res.json({
            success: true,
            message: `${result.deletedCount} report(s) deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error bulk deleting blog reports:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};




