  //channels.js
  const express = require('express');
  const router = express.Router();
  const { Group, User, Channel } = require('../models'); // Ensure your models are correctly imported
  
    
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
  
  // DELETE method to delete a channel
  router.delete('/api/channels/delete/:channelId', async (req, res) => {
      const channelId = req.params.channelId;
  
      try {
          // Find the channel and delete it
          const deletedChannel = await Channel.findByIdAndDelete(channelId);
          if (!deletedChannel) {
              return res.status(404).json({ message: 'Channel not found' });
          }
  
          // Remove the channel ID from the groups that contain it
          await Group.updateMany(
              { channels: channelId }, // Find groups that have the channel
              { $pull: { channels: channelId } } // Remove the channel ID from the array
          );
  
          res.status(200).json({ message: 'Channel deleted successfully' });
      } catch (error) {
          console.error('Error deleting channel:', error);
          res.status(500).json({ message: 'Internal server error' });
      }
  });
  
  
    module.exports = router;