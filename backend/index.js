// File: backend/index.js (CORRECTED ORDER)

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const institutionRoutes = require('./routes/institutionRoutes');
const ewasteRoutes = require('./routes/ewasteRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables at the very top
dotenv.config();
const app = express();


// --- 1. CORE MIDDLEWARE ---
// Middleware MUST be defined BEFORE the routes.

// Enable Cross-Origin Resource Sharing for all origins
app.use(cors());

// Body parser to correctly handle JSON data from requests
app.use(express.json());

// Serve static files (like uploaded documents) from the 'uploads' directory
app.use('/uploads', express.static('uploads'));


// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.error('MongoDB connection error:', err));


// --- 3. API ROUTES ---
// Now that the middleware is set up, we can define our API routes.
app.use('/api', institutionRoutes);
app.use('/api/ewaste', ewasteRoutes);
app.use('/api/admin', adminRoutes);


// --- 4. BASIC SERVER CHECK ROUTE ---
app.get('/', (req, res) => {
    res.send('E-Waste Manager Backend API is running!');
});


// --- 5. SERVER START ---
// This should always be at the very end of the file.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});