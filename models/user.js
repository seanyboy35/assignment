const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  roles: {
    type: [String],
    enum: ['Super Admin', 'Group Admin', 'User'],
    default: ['User']
  },
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }]
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
