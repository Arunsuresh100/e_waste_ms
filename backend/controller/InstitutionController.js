// File: backend/controller/InstitutionController.js (CORRECTED)

const Institution = require('../models/Institution');
const Login = require('../models/Login');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Configuration (No changes needed) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('document');


// --- Controller function for institution registration ---
exports.registerInstitution = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || err });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Verification document is required.' });
        }

        const { category, institutionName, institutionEmail, phoneNumber, password } = req.body;
        const documentPath = req.file.path;
        let savedInstitution = null;

        try {
            const existingLogin = await Login.findOne({ email: institutionEmail });
            if (existingLogin) {
                fs.unlinkSync(documentPath);
                return res.status(400).json({ message: 'This email address is already registered.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newInstitution = new Institution({
                category,
                institutionName,
                institutionEmail,
                phoneNumber,
                password: hashedPassword,
                documentPath,
            });
            savedInstitution = await newInstitution.save();

            // --- THIS IS THE FIX ---
            // Instead of relying on a default value, we explicitly set the role.
            // This is much safer and less prone to errors.
            const newLogin = new Login({
                userId: savedInstitution._id,
                email: savedInstitution.institutionEmail,
                password: savedInstitution.password,
                role: 'institution' // <-- HARDCODED a safe, explicit value
            });
            await newLogin.save();

            // Add 'return' to ensure the function stops after sending a response
            return res.status(201).json({ message: 'Institution registered successfully!' });

        } catch (error) {
            console.error('REGISTRATION ERROR:', error);

            if (savedInstitution) {
                await Institution.findByIdAndDelete(savedInstitution._id);
            }
            
            if (fs.existsSync(documentPath)) {
                fs.unlinkSync(documentPath);
            }

            return res.status(500).json({ message: 'Server error during registration. Please try again.' });
        }
    });
};