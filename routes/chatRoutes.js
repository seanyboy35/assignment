const express = require('express');
const router = express.Router();

// Mock chat storage (in-memory)
let messages = {};

// Send a Message in a Channel
router.post('/:groupId/:channelId/sendMessage', (req, res) => {
    const { groupId, channelId } = req.params;
    const { username, message } = req.body;
    if (!messages[groupId]) messages[groupId] = {};
    if (!messages[groupId][channelId]) messages[groupId][channelId] = [];
    messages[groupId][channelId].push({ username, message, timestamp: new Date() });
    res.status(201).json({ message: 'Message sent successfully' });
});

// Get Messages from a Channel
router.get('/:groupId/:channelId/messages', (req, res) => {
    const { groupId, channelId } = req.params;
    const groupMessages = messages[groupId] && messages[groupId][channelId];
    if (groupMessages) {
        res.status(200).json(groupMessages);
    } else {
        res.status(404).json({ message: 'No messages found' });
    }
});

module.exports = router;
