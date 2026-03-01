// File: backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // First, check if logged in
const adminMiddleware = require('../middleware/adminMiddleware'); // THEN, check if admin

// Define the middleware chain to be used for all routes in this file
const adminAuth = [authMiddleware, adminMiddleware];

// @route   GET /api/admin/requests
// @desc    Get all user requests
router.get('/requests', adminAuth, adminController.getAllRequests);

// @route   PUT /api/admin/requests/:requestId/status
// @desc    Update the status of a request
router.put('/requests/:requestId/status', adminAuth, adminController.updateRequestStatus);
// --- ADD THIS NEW ROUTE AT THE END ---
// @route   GET /api/admin/requests/:requestId/history
// @desc    Get the status history for a single request
router.get('/requests/:requestId/history', adminAuth, adminController.getRequestHistory);

module.exports = router;