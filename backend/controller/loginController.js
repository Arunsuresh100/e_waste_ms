// File: backend/controller/loginController.js (CORRECTED)

const Login = require('../models/Login');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        // Find the user by email and populate their associated institution/user data if it exists
        const user = await Login.findOne({ email }).populate('userId');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // --- FIX: Handle Admin Login Differently ---
        // We need to create the correct payload based on the user's role.

        let payload;

        if (user.role === 'admin') {
            // If the user is an admin, their unique ID is in the 'logins' collection itself.
            payload = {
                user: {
                    id: user._id // Use the ID from the login document
                }
            };
        } else {
            // If it's a regular user, use the ID from their associated institution document.
            // We also check if userId exists to prevent crashes if data is inconsistent.
            if (!user.userId) {
                return res.status(500).json({ message: 'User data is inconsistent. Missing user details.' });
            }
            payload = {
                user: {
                    id: user.userId._id 
                }
            };
        }
        
        // Now, sign the token with the correct payload
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                
                const successMessage = user.role === 'admin' 
                    ? 'Admin login successful!' 
                    : 'Login successful!';

                res.status(200).json({ 
                    message: successMessage,
                    token: token,
                    user: user 
                });
            }
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};