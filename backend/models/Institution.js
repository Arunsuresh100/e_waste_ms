//registration based
const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    category: { type: String, required: true, enum: ['school', 'hospital', 'railway-station', 'office'] },
    institutionName: { type: String, required: true },
    institutionEmail: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true }, // **Important: You'll hash this in a real app!**
    documentPath: { type: String }, // To store the path to the uploaded document
    role: { type: String, default: 'institution' }, // Define a role for this type of user
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institution', institutionSchema);