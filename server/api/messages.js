const express = require('express');
const router = express.Router();
const { Message } = require('../models'); // Ensure your models are correctly imported

// POST /api/messages
router.post('/', async (req, res) => {
  const { username, text } = req.body;

  console.log('Received message:', username, text); // Log incoming message

  try {
    const newMessage = new Message({
      username: username,
      text: text,
      timestamp: new Date(),
    });

    await newMessage.save();
    console.log('Message saved to MongoDB:', newMessage); // Log the saved message

    res.status(200).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error); // Log any error
    res.status(500).json({ error: 'Error saving message to database' });
  }
});

module.exports = router;
