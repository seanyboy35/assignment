// controllers/userController.js
const User = require('../models/User');

// Promote a user to Group Admin
exports.promoteToGroupAdmin = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        user.roles.push('GroupAdmin');
        await user.save();
        res.status(200).json({ message: 'User promoted to Group Admin', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
