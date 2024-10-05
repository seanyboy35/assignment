// routes.js
const express = require('express');
const { User, Group, Channel } = require('./models.js');
const router = express.Router();

// User Routes
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// Group Routes
router.get('/groups', async (req, res) => {
  const groups = await Group.find().populate('admins').populate('channels');
  res.json(groups);
});

router.post('/groups', async (req, res) => {
  const group = new Group(req.body);
  await group.save();
  res.json(group);
});

// Channel Routes
router.get('/channels', async (req, res) => {
  const channels = await Channel.find().populate('group');
  res.json(channels);
});

router.post('/channels', async (req, res) => {
  const channel = new Channel(req.body);
  await channel.save();
  res.json(channel);
});

// routes/messageRoutes.js

const { Message } = require('./models'); // Import the Message model

// Route to Add a New Message
router.post('/messages', async (req, res) => {
  try {
    const { user, text } = req.body;
    const message = new Message({ user, text });
    await message.save();  // Save the message to MongoDB
    res.status(201).json(message);  // Respond with the saved message
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Route to Retrieve All Messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();  // Get all messages from MongoDB
    res.json(messages);  // Respond with the list of messages
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

module.exports = router;  // Export the router so it can be used in the main server file

