const express = require('express');
const router = express.Router();

// Create a New Channel in a Group
router.post('/:groupId/createChannel', (req, res) => {
    const { groupId } = req.params;
    const { name } = req.body;
    const group = groups.find(g => g.id == groupId);
    if (group) {
        const newChannel = { id: group.channels.length + 1, name };
        group.channels.push(newChannel);
        res.status(201).json({ message: 'Channel created successfully', channel: newChannel });
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

// Get All Channels in a Group
router.get('/:groupId/channels', (req, res) => {
    const { groupId } = req.params;
    const group = groups.find(g => g.id == groupId);
    if (group) {
        res.status(200).json(group.channels);
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

module.exports = router;
