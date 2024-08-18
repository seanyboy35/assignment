const ChannelSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    messages: [{
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  });
  
  const Channel = mongoose.model('Channel', ChannelSchema);
  module.exports = Channel;
  