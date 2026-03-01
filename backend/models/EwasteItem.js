// File: backend/models/EwasteItem.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ewasteItemSchema = new Schema({
    requestId: {
        type: Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
    },
    category: {
        type: String,
        enum: ['Smartphones', 'Laptops', 'Televisions', 'Refrigerators', 'Other'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('EwasteItem', ewasteItemSchema);