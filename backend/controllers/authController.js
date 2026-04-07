const User = require('../models/User');

exports.getMe = async (req, res) => {
    try {
        // Since we don't have JWT, assume we are querying a generic admin or passing an ID
        // For mock purposes, just return the first user or based on a query param
        const id = req.query.id || "1"; 
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { role, name } = req.body;
        // Mock login returning the user 
        const users = await User.find({ role });
        let user = users.length > 0 ? users[0] : null;
        
        if (!user) {
           user = new User({ role, name: name || "New User" });
           await user.save();
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
