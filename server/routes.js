// routes.js
const express = require('express');
const { User, Group, Channel } = require('./models');
const router = express.Router();

// Define routes for user, group, and channel operations
// User Routes
router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
@@ -14,6 +15,28 @@ router.post('/users', async (req, res) => {
  res.json(user);
});

// Add more routes for Groups and Channels
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

module.exports = router;