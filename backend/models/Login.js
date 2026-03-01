// backend/models/Login.js

const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    // This will store the ObjectId from the corresponding Institution document
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Institution', // This creates a reference to the Institution model
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Login', loginSchema);