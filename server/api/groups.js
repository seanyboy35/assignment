//groups.js
const express = require('express');
const router = express.Router();
const { Group, User } = require('../models'); // Ensure your models are correctly imported



router.post('/requestJoin', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

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

  router.post('/api/groups/remove-from-requests', async (req, res) => {
    const { username, groupName } = req.body;

    try {
        // Use $pull to remove the username from the requests array
        const updatedGroup = await Group.findOneAndUpdate(
            { name: groupName },
            { $pull: { requests: username } },
            { new: true }
        );

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'Username removed from requests array', updatedGroup });
    } catch (error) {
        console.error('Error removing username from requests:', error);
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
  

  module.exports = router;