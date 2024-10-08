//models.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Ensure email is unique as well
  password: { type: String, required: true },
  role: { type: String, required: true },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],  // Groups the user belongs to
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }]  // Channels the user belongs to
});


// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requests: { type: [String], default: []},
});

// Channel Schema
const channelSchema = new mongoose.Schema({
  name: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  members:  [{ type: String }] // Store usernames or user IDs
});


// Message Schema
const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Creating models from the schemas
const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);
const Channel = mongoose.model('Channel', channelSchema);
const Message = mongoose.model('Message', messageSchema);

// Exporting all models
module.exports = { User, Group, Channel, Message };