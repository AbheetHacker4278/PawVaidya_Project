import activityLogModel from '../models/activityLogModel.js';

/**
 * Log user/doctor activity
 * @param {String} userId - User or Doctor ID
 * @param {String} userType - 'user' or 'doctor'
 * @param {String} activityType - Type of activity (login, logout, page_view, action, etc.)
 * @param {String} activityDescription - Detailed description
 * @param {Object} req - Express request object (for IP and User-Agent)
 * @param {Object} metadata - Additional metadata
 */
export const logActivity = async (userId, userType, activityType, activityDescription, req = null, metadata = {}) => {
    try {
        const ipAddress = req?.ip || req?.connection?.remoteAddress || '';
        const userAgent = req?.headers?.['user-agent'] || '';

        await activityLogModel.create({
            userId,
            userType,
            activityType,
            activityDescription,
            ipAddress,
            userAgent,
            metadata,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error, just log it
    }
};

