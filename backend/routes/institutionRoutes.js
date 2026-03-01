// backend/routes/yourMainRouteFile.js (e.g., api.js)

const express = require('express');
const router = express.Router();
const institutionController = require('../controller/InstitutionController');
const loginController = require('../controller/loginController'); // Import login controller

// Route for institution registration
router.post('/register', institutionController.registerInstitution);

// *** NEW: Route for user/admin login ***
router.post('/login', loginController.loginUser);

module.exports = router;