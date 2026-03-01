// File: backend/models/Request.js (CORRECTED)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        // --- THIS IS THE FIX ---
        // The list of allowed values now matches the admin dashboard's options.
        enum: ['inactive', 'On Progress', 'Approved', 'Collected', 'Completed', 'Cancelled'],
        default: 'inactive',
    },
});

module.exports = mongoose.model('Request', requestSchema);