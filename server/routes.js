// routes.js
const express = require('express');
const { Group, Channel } = require('./models');
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

  const newUser = new User({ username, password, email });

  try {
    await newUser.save(); // Save user to the database
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error); // Log the error
    res.status(400).send({ error: error.message });
  }
});
// Route to create a new group
router.post('/api/create-group', (req, res) => {
  const { name, adminId } = req.body; // Assuming adminId is passed from the request

  const newGroup = new Group({ name, adminId });

  newGroup.save()
    .then(group => {
      res.status(201).json({ message: 'Group created successfully!', group });
    })
    .catch(error => {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Error creating group', error });
    });
});

// Route to create a new channel
router.post('/api/create-channel', (req, res) => {
  const { name, groupId } = req.body; // Assuming groupId is passed from the request

  const newChannel = new Channel({ name, groupId });

  newChannel.save()
    .then(channel => {
      // Optionally update the corresponding group to include this channel
      return Group.findByIdAndUpdate(
        groupId,
        { $push: { channels: channel._id } }, // Add channel ID to the group's channels array
        { new: true }
      );
    })
    .then(group => {
      res.status(201).json({ message: 'Channel created successfully!', group });
    })
    .catch(error => {
      console.error('Error creating channel:', error);
      res.status(500).json({ message: 'Error creating channel', error });
    });
});
router.post('/requestJoin', (req, res) => {
  const { username, groupName } = req.body;
  
  // Log received request for debugging
  console.log(`Received join request from ${username} for group ${groupName}`);

  // Find the group in the database and add the join request
  // Assuming you have a Group model set up
  Group.findOne({ name: groupName })
      .then(group => {
          if (!group) {
              return res.status(404).send('Group not found');
          }
          // Add the request to the group
          group.requests.push(username);
          return group.save();
      })
      .then(() => res.status(200).send('Join request sent'))
      .catch(error => {
          console.error('Error handling join request:', error);
          res.status(500).send('Server error');
      });
});

module.exports = router;  // Export the router so it can be used in the main server file

