// File: backend/models/StatusHistory.js (NEW FILE)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusHistorySchema = new Schema({
    // Link to the original e-waste request
    requestId: {
        type: Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
    },
    // Link to the admin who made the change (from the 'logins' collection)
    changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Login',
        required: true,
    },
    // The status before the admin's action
    previousStatus: {
        type: String,
        required: true,
    },
    // The new status set by the admin
    newStatus: {
        type: String,
        required: true,
    },
    // The timestamp of when this change occurred
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('StatusHistory', statusHistorySchema);