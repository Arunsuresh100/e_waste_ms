// File: backend/controllers/ewasteController.js

const Request = require('../models/Request');
const EwasteItem = require('../models/EwasteItem');

// Save a new e-waste item to an 'inactive' request
exports.saveEwasteItem = async (req, res) => {
    const { category, description, count } = req.body;
    const userId = req.user.id; // From authMiddleware

    try {
        let request = await Request.findOne({ userId, status: 'inactive' });

        if (!request) {
            request = new Request({ userId, status: 'inactive' });
            await request.save();
        }

        const newEwasteItem = new EwasteItem({
            requestId: request._id,
            category,
            description,
            count,
        });

        await newEwasteItem.save();
        res.status(201).json(newEwasteItem);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Get all saved items for the current user (from their inactive request)
exports.getSavedItems = async (req, res) => {
    const userId = req.user.id;
    try {
        const request = await Request.findOne({ userId, status: 'inactive' });
        if (!request) {
            return res.json([]);
        }
        const savedItems = await EwasteItem.find({ requestId: request._id });
        res.json(savedItems);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Remove a single saved e-waste item
exports.removeEwasteItem = async (req, res) => {
    try {
        const item = await EwasteItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: 'Item not found' });
        }
        await EwasteItem.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Item removed' });
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Submit all saved items (change request status from 'inactive' to 'On Progress')
exports.submitAllRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        const request = await Request.findOne({ userId, status: 'inactive' });
        if (!request) {
            return res.status(400).json({ msg: 'No items to submit' });
        }
        request.status = 'On Progress';
        await request.save();
        res.json({ msg: 'All requests submitted successfully', request });
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Get the user's history of active/completed requests
exports.getRequestHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const requests = await Request.find({ userId, status: { $ne: 'inactive' } }).sort({ date: -1 });
        const history = await Promise.all(requests.map(async (request) => {
            const items = await EwasteItem.find({ requestId: request._id });
            return {
                ...request.toObject(),
                items,
            };
        }));
        res.json(history);
    } catch (error) {
        res.status(500).send('Server error');
    }
};