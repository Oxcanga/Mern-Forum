const User = require('../models/User');

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin()) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const moderatorAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isModerator()) {
            return res.status(403).json({ message: 'Access denied. Moderator privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { adminAuth, moderatorAuth };
