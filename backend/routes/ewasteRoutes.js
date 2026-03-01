// File: backend/routes/ewasteRoutes.js (CORRECTED)

const express = require('express');
const router = express.Router();

// --- FIX: The path now correctly uses 'controller' (singular) ---
const ewasteController = require('../controller/ewasteController');

const authMiddleware = require('../middleware/authMiddleware');

// Every route in this file is protected by the authMiddleware
router.post('/save', authMiddleware, ewasteController.saveEwasteItem);
router.get('/saved', authMiddleware, ewasteController.getSavedItems);
router.delete('/remove/:id', authMiddleware, ewasteController.removeEwasteItem);
router.post('/submit', authMiddleware, ewasteController.submitAllRequests);
router.get('/history', authMiddleware, ewasteController.getRequestHistory);

module.exports = router;