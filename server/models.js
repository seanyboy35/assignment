const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: String,
  roles: [String],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
});

// Channel Schema
const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
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
