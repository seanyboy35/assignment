// routes.js
const express = require('express');
const { Group, Channel } = require('./models.js');
const { User } = require('./models');
const mongoose = require('mongoose');
const router = express.Router();
const usersRoutes = require('./api/users');
router.use('/users', usersRoutes); // All user-related routes are under /api/users
console.log('User model:', User); // This should log the User model

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

// Registration endpoint
router.post('/register', async (req, res) => {
  console.log('Registration attempt:', req.body); // Log the request body
  const { username, password, email } = req.body;

  const newUser = new User({ id: new mongoose.Types.ObjectId(), username, password, email });

  try {
    await newUser.save(); // Save user to the database
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error); // Log the error
    res.status(400).send({ error: error.message });
  }
});

module.exports = router; // Export the router


module.exports = router;

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;  // Export the router so it can be used in the main server file

