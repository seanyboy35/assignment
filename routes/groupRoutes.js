const express = require('express');
const router = express.Router();

// Mock Database for Groups (replace with real DB later)
let groups = [{ id: 1, name: 'General', members: [], channels: [] }];

// Create a New Group
router.post('/create', (req, res) => {
    const { name } = req.body;
    const newGroup = { id: groups.length + 1, name, members: [], channels: [] };
    groups.push(newGroup);
    res.status(201).json({ message: 'Group created successfully', group: newGroup });
});

// Get All Groups
router.get('/', (req, res) => {
    res.status(200).json(groups);
});

// Add User to Group
router.post('/:groupId/addUser', (req, res) => {
    const { groupId } = req.params;
    const { username } = req.body;
    const group = groups.find(g => g.id == groupId);
    if (group) {
        group.members.push(username);
        res.status(200).json({ message: 'User added to group', group });
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

module.exports = router;
