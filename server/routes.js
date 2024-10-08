// routes.js
const express = require('express');
const { Group, Channel } = require('./models');
const { User } = require('./models');
const mongoose = require('mongoose');
const router = express.Router();
const usersRoutes = require('./api/users');
const groupsRoutes = require('./api/groups');
const channelsRoutes = require('./api/channels');

router.use('/api/users', usersRoutes); // All user-related routes are under /api/users
router.use('/api/channels', channelsRoutes); 
router.use('/api/groups', groupsRoutes); // All user-related routes are under /api/users
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
router.post('groups/requestJoin', (req, res) => {
  console.log("Request received for joining group");
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

router.post('/api/groups/approve-request', async (req, res) => {
  const { username, groupName } = req.body;

  try {
    // Find the group by name
    const group = await Group.findOne({ name: groupName });

    // If no group is found, return an error
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Initialize the members array if it doesn't exist
    if (!group.members) {
      group.members = [];
    }

    // Add the username to the members array
    group.members.push(username);

    // Save the updated group back to the database
    await group.save();

    // Now update the user's groups field as well
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize the groups array if it doesn't exist
    if (!user.groups) {
      user.groups = [];
    }

    // Add the group name to the user's groups array
    user.groups.push(groupName);

    // Save the updated user back to the database
    await user.save();

    res.status(200).json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
});

router.get('/api/user/requested-groups', (req, res) => {
  console.log("Received request to join group");
  const userId = req.user.id; // Get the user's ID from the session or token

  // Logic to retrieve user information, including requested groups
  User.findById(userId, 'username requestedGroups')
    .populate('requestedGroups') // Adjust based on your schema
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ username: user.username, groupName: user.requestedGroups[0]?.name }); // Assuming you return the first requested group
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    });
});

router.post('/api/channels/join', async (req, res) => {
  try {
      const { username, channelId } = req.body;

      // Log the incoming request data
      console.log(`Username: ${username}, Channel ID: ${channelId}`);

      // Find the user and channel by their IDs
      const user = await User.findOne({ username: username });
      const channel = await Channel.findById(channelId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      if (!channel) {
          return res.status(404).json({ message: 'Channel not found' });
      }

      // Add the user's _id to the channel's members list if not already added
      if (!channel.members.includes(user._id)) {
          channel.members.push(user._id); // Use user._id here
          await channel.save();
      }

      // Add the channelId to the user's channels array if not already added
      if (!user.channels.includes(channelId)) {
          user.channels.push(channelId);
          await user.save();
      }

      res.status(200).json({ message: 'Successfully joined the channel' });
  } catch (err) {
      console.error('Error joining channel:', err); // Log the error in the server console
      res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all channels
router.get('/api/channels', async (req, res) => {
  try {
    const channels = await Channel.find(); // Fetch all channels from the database
    res.json(channels); // Send the channels as a JSON response
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ message: 'Server error' }); // Handle errors
  }
});

module.exports = router;  // Export the router so it can be used in the main server file