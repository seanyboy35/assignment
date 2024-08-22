const GroupSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    channels: [{
      type: Schema.Types.ObjectId,
      ref: 'Channel'
    }]
  });
  
  const Group = mongoose.model('Group', GroupSchema);
  module.exports = Group;
  