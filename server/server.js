//server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const routes = require('./routes');
const cors = require('cors');  // Import cors for use in express
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const messageRoutes = require('./api/messages');
const userRoutes = require('./api/users');
const {Group, User, Channel} = require('./models');
const channelsRoutes = require('./api/channels');
// Enable CORS for your entire Express app (optional)
app.use(cors({
  origin: "http://localhost:4200",  // Allow your Angular app (remove the trailing slash)
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

mongoose.connect('mongodb://localhost:27017/MyDB',{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
});

// Middleware
app.use(bodyParser.json());  // Parse incoming JSON requests
app.use(express.json());
app.use('/api/messages', messageRoutes);
app.use('/api/channels', channelsRoutes);

// User routes
app.use('/api', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Chat Application!');
});

const { Message } = require('./models'); // Importing the Message model

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle incoming messages
  socket.on('chat message', async (messageObject) => {
    console.log('Message received:', messageObject);

    try {
      // Create a new message instance using the Message model
      const newMessage = new Message({
        username: messageObject.username,
        text: messageObject.text,
        timestamp: new Date(),
      });

      // Save the message to MongoDB
      await newMessage.save();
      console.log('Message saved to MongoDB:', newMessage);

      // Broadcast the message to all connected clients
      io.emit('chat message', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Endpoint to save messages to MongoDB
app.post('/api/messages', async (req, res) => {
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
// User retrieval route
app.get('/users/:id', async (req, res) => {
  try {
    // Change this to a different variable name to avoid conflict
    const userId = req.params.id; 
    const foundUser = await User.findById(userId); // Fetch user from the database
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(foundUser); // Send the found user back as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/groups/requestJoin', async (req, res) => {
  const { username, groupName } = req.body;
  try {
    // Fetch the group by its name
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Add the user to the join requests if not already requested
    if (!group.requests.includes(username)) {
      group.requests.push(username);
      await group.save();
      return res.status(200).json({ message: 'Join request sent successfully' });
    } else {
      return res.status(400).json({ message: 'User has already requested to join this group' });
    }
  } catch (error) {
    console.error('Error processing join request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Define the approve request route
app.post('/api/groups/approve-request', async (req, res) => {
  const { username, groupName } = req.body;

  // Add your logic to approve the request here
  try {
    // Example logic to update user and group in MongoDB
    const user = await User.findOne({ username });
    const group = await Group.findOne({ name: groupName });

    if (!user || !group) {
      return res.status(404).json({ message: 'User or group not found' });
    }

    // Update group memberIds and user groups
    group.memberIds.push(user._id);
    user.groups.push(group._id);

    await group.save();
    await user.save();

    res.json({ message: 'Request approved!' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/api/groups/remove-from-requests', async (req, res) => {
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

app.post('/api/channels/join', async (req, res) => {
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
app.get('/api/channels', async (req, res) => {
  try {
    const channels = await Channel.find(); // Fetch all channels from the database
    res.json(channels); // Send the channels as a JSON response
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ message: 'Server error' }); // Handle errors
  }
});

// DELETE endpoint to delete a user account
// DELETE method to delete a user account
app.delete('/api/users/deleteAccount/:userId', async (req, res) => {
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

// DELETE method to delete a user account based on username
app.delete('/api/users/deleteUser/:username', async (req, res) => {
  const username = req.params.username;

  try {
      // Find the user by username to get their userId
      const user = await User.findOne({ username: username });
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const userId = user._id; // Get userId from the user document

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
      await User.findByIdAndDelete(userId);
      
      res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/users/promote/:username', async (req, res) => {
  const { username } = req.params;

  try {
      // Find the user by username
      const user = await User.findOne({ username });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Define the role hierarchy
      const roles = ['chatUser', 'groupAdmin', 'superAdmin'];

      // Get the current role index
      const currentRoleIndex = roles.indexOf(user.role);

      // Promote the user if not already at the highest role
      if (currentRoleIndex < roles.length - 1) {
          user.role = roles[currentRoleIndex + 1];
          await user.save();
          return res.status(200).json({ message: `User ${username} promoted to ${user.role}` });
      } else {
          return res.status(400).json({ message: 'User is already at the highest role' });
      }
  } catch (error) {
      console.error('Error promoting user:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH method to demote a user account
app.patch('/api/users/demote/:username', async (req, res) => {
  const username = req.params.username;

  try {
      // Fetch the user by username
      const user = await User.findOne({ username: username });
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Determine the current role and update to the next lower role
      const roles = ['chatUser', 'groupAdmin', 'superAdmin'];
      const currentRoleIndex = roles.indexOf(user.role);

      if (currentRoleIndex === -1) {
          return res.status(400).json({ message: 'Invalid role' });
      }

      // If the current role is the lowest, return an error
      if (currentRoleIndex === 0) {
          return res.status(400).json({ message: 'User is already at the lowest role' });
      }

      // Update the user's role to the next lower role
      user.role = roles[currentRoleIndex - 1];
      await user.save();

      res.status(200).json({ message: `User ${username} demoted to ${user.role}` });
  } catch (error) {
      console.error('Error demoting user:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));