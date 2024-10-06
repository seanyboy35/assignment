const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Ensure the path is correct
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

// Add user to a group
router.post('/join-group', async (req, res) => {
  const { userId, groupName } = req.body;

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Add group if not already in user's groups
      if (!user.groups.includes(groupId)) {
          user.groups.push(groupId);
          await user.save();
      }

      res.status(200).json({ message: 'Group joined successfully', groups: user.groups });
  } catch (error) {
      res.status(500).json({ message: 'Error joining group', error });
  }
});

// Add user to a channel
router.post('/join-channel', async (req, res) => {
  const { userId, channelId } = req.body;

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Add channel if not already in user's channels
      if (!user.channels.includes(channelId)) {
          user.channels.push(channelId);
          await user.save();
      }

      res.status(200).json({ message: 'Channel joined successfully', channels: user.channels });
  } catch (error) {
      res.status(500).json({ message: 'Error joining channel', error });
  }
});



module.exports = router; // Export the router
