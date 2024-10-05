const express = require('express');
const router = express.Router();
const { User } = require('../models'); // Ensure the path is correct
const mongoose = require('mongoose');



// Registration endpoint
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
  
    const newUser = new User({ id: new mongoose.Types.ObjectId(), username, password, email });
  
    try {
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  });

module.exports = router; // Export the router
