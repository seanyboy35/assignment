// controllers/groupController.js
const Group = require('../models/Group');

// Create a new group
exports.createGroup = async (req, res) => {
    const { name, adminId } = req.body;
    try {
        const group = new Group({ name, admin: adminId });
        await group.save();
        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        await Group.findByIdAndDelete(groupId);
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
