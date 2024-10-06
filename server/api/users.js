const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Ensure the path is correct
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Registration endpoint
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user instance with the hashed password
        const newUser = new User({
            id: new mongoose.Types.ObjectId(),
            username,
            password: hashedPassword, // Now hashedPassword is defined here
            email
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
    res.status(200).json({ message: 'Login successful', user: { username: user.username, email: user.email } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});


module.exports = router; // Export the router
