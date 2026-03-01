// File: backend/controller/adminController.js (FINAL & COMPLETE)

const Request = require('../models/Request');
const EwasteItem = require('../models/EwasteItem');
const Institution = require('../models/Institution');
const StatusHistory = require('../models/StatusHistory');

// Get all requests that have been submitted by users
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: { $ne: 'inactive' } })
            .populate({
                path: 'userId',
                model: Institution,
                select: 'institutionName institutionEmail'
            })
            .sort({ date: -1 });

        const detailedRequests = await Promise.all(requests.map(async (request) => {
            const items = await EwasteItem.find({ requestId: request._id });
            return {
                ...request.toObject(),
                items,
            };
        }));

        res.json(detailedRequests);
    } catch (error) {
        console.error("Admin fetch error:", error);
        res.status(500).send('Server error');
    }
};

// Update the status of a specific request AND log the change
exports.updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;
    const validStatuses = ['On Progress', 'Approved', 'Collected', 'Completed', 'Cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided.' });
    }

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        const previousStatus = request.status;
        const adminId = req.user.id;

        request.status = status;
        await request.save();
        
        const newHistoryRecord = new StatusHistory({
            requestId: requestId,
            changedBy: adminId,
            previousStatus: previousStatus,
            newStatus: status,
        });
        await newHistoryRecord.save();

        res.json({ msg: 'Request status updated successfully and change was logged.', request });
    } catch (error) {
        console.error("Admin update error:", error);
        res.status(500).send('Server error');
    }
};

// --- THIS IS THE FUNCTION THAT WAS MISSING OR NOT EXPORTED ---
// Get the status change history for a single request
exports.getRequestHistory = async (req, res) => {
    const { requestId } = req.params;

    try {
        const history = await StatusHistory.find({ requestId: requestId })
            .populate({
                path: 'changedBy',
                model: 'Login',
                select: 'email' // Only show the admin's email
            })
            .sort({ timestamp: -1 }); // Show the most recent change first

        res.json(history);
    } catch (error) {
        console.error("Admin get history error:", error);
        res.status(500).send('Server error');
    }
};