// File: backend/middleware/adminMiddleware.js (CORRECTED & SIMPLIFIED)

const Login = require('../models/Login');
const Institution = require('../models/Institution'); // We might need this for lookup

const adminMiddleware = async (req, res, next) => {
    try {
        // req.user.id is attached by authMiddleware. It's the unique ID for the logged-in entity.
        // We need to find which Login document corresponds to this ID.

        // An admin's ID comes directly from the Login collection. A user's ID comes from Institution.
        // The most reliable way is to find the Login document.
        let loginUser = await Login.findOne({ userId: req.user.id }); // For regular users
        
        if (!loginUser) {
            loginUser = await Login.findById(req.user.id); // For admins
        }

        // If after checking both ways, we still don't have a user, deny access.
        if (!loginUser) {
            return res.status(401).json({ msg: 'User login profile not found.' });
        }
        
        if (loginUser.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Administrator privileges required.' });
        }

        // If we reach here, the user is a verified admin.
        next();

    } catch (error) {
        console.error("Admin Middleware Error:", error);
        res.status(500).json({ msg: 'Server error during admin verification' });
    }
};

module.exports = adminMiddleware;