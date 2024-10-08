//users.js
const express = require('express');
const router = express.Router();
const { User, Channel, Group } = require('../models'); // Ensure the path is correct
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Predefined users
const predefinedUsers = [
  {
      username: 'superAdmin',
      password: '123',
      email: 'superadmin@example.com'
  },
  {
      username: 'groupAdmin',
      password: '123',
      email: 'groupadmin@example.com'
  }
];

// Function to create predefined users if they don't exist
const createPredefinedUsers = async () => {
  const predefinedUsers = [
      { username: 'superAdmin', password: '123', email: 'superadmin@example.com', role: 'superAdmin' },
      { username: 'groupAdmin', password: '123', email: 'groupadmin@example.com', role: 'groupAdmin' },
  ];

  for (const user of predefinedUsers) {
      const existingUser = await User.findOne({ username: user.username });
      if (!existingUser) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          const newUser = new User({ ...user, password: hashedPassword });
          await newUser.save();
          console.log(`Predefined user created: ${user.username}`);
      }
  }
};

// Call the function to create predefined users on server start
createPredefinedUsers();

// Registration endpoint
router.post('/register', async (req, res) => {
    const { username, password, email, role } = req.body;
// Validate role
if (!role) {
  return res.status(400).json({ message: 'Role is required' });
}
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine role based on username
        let role = '';
        if (username === 'superAdmin') {
            role = 'superAdmin';
        } else if (username === 'groupAdmin') {
            role = 'groupAdmin';
        } else {
            role = 'chatUser'; // Default role for other users
        }
        
        // Generate a salt
        const salt = await bcrypt.genSalt(10);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user instance with the hashed password
        const newUser = new User({
            username,
            password: hashedPassword, // Now hashedPassword is defined here
            email,
            role
        });

        console.log('New User Registered: ', username, email);
        
        // Save the user to the database
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the hashed password with the provided password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // If login is successful, you can send a success message or user details
    res.status(200).json({ message: 'Login successful', user: { _id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Endpoint to join a group
router.post('/join-group', async (req, res) => {
  const { userId, groupName } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if groupName already exists in the user's groups
    if (user.groups.includes(groupName)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    user.groups.push(groupName); // Add the groupName to user's groups
    await user.save(); // Save the updated user

    res.status(200).json({ message: 'Joined group successfully', user });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Error joining group' });
  }
});

// Route to join a channel
router.post('/joinChannel', async (req, res) => {
  const { userId, channelId } = req.body;

  try {
    const user = await User.findById(userId);
    const channel = await Channel.findById(channelId).populate('group'); // Fetch channel and its group

    if (!user || !channel) {
      return res.status(404).json({ message: 'User or Channel not found' });
    }

    // Add channel to user
    user.channels.push(channelId);

    // Optionally, you might want to add the group to user if not already present
    if (!user.groups.includes(channel.group._id)) {
      user.groups.push(channel.group._id);
    }

    await user.save();
    res.status(200).json({ message: 'Joined channel successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a group
router.post('/create-group', async (req, res) => {
  try {
      const { name, adminId } = req.body;

      // Create a new group
      const newGroup = new Group({
          name,
          adminId,
          channels: [],
          members: [],
          requests: []
      });

      await newGroup.save();
      res.status(201).json(newGroup);
  } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Error creating group' });
  }
});

router.post('/create-channel', async (req, res) => {
  try {
    const { name, groupId } = req.body;

    // Step 1: Create the new channel document
    const newChannel = new Channel({
      name,
      groupId,
      members: []  // Add default members if needed
    });
    await newChannel.save();

    // Step 2: Update the corresponding group to include the new channel's _id
    const group = await Group.findById(groupId);
    group.channels.push(newChannel._id);
    await group.save();

    res.status(201).json(newChannel); // Send the newly created channel back
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Fetch all groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find().populate('channels'); // Adjust if channels need population
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete Account API
// DELETE endpoint to delete a user account
// DELETE method to delete a user account
router.delete('/api/users/deleteAccount/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      // Remove user from Group and Channel references
      await Group.updateMany({ 
          $or: [{ memberIds: userId }, { admins: userId }] 
      }, {
          $pull: { memberIds: userId, admins: userId }
      });

      await Channel.updateMany({ 
          members: userId 
      }, {
          $pull: { members: userId }
      });

      // Delete the user
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router; // Export the router