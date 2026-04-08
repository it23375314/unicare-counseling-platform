const User = require('../models/User');

exports.getMe = async (req, res) => {
    try {
        const id = req.query.id; 
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(200).json({ success: true, data: { name: "Guest User", role: "student", email: "guest@unicare.edu", _id: "guest-id" } });
        }
        
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
           user = new User({ 
             role, 
             name: name || "New User", 
             email: `${(name || "user").toLowerCase().replace(/\s+/g, '.')}@unicare.edu` 
           });
           await user.save();
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
