// controllers/channelController.js
const Channel = require('../models/Channel');

// Create a new channel in a group
exports.createChannel = async (req, res) => {
    const { groupId, name } = req.body;
    try {
        const channel = new Channel({ group: groupId, name });
        await channel.save();
        res.status(201).json({ message: 'Channel created successfully', channel });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a channel
exports.deleteChannel = async (req, res) => {
    const { channelId } = req.params;
    try {
        await Channel.findByIdAndDelete(channelId);
        res.status(200).json({ message: 'Channel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
