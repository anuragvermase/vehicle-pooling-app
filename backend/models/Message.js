import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  content: {
    type: String,
    required: true,
    maxLength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'location', 'image', 'system'],
    default: 'text'
  },
  metadata: {
    location: {
      lat: Number,
      lng: Number
    },
    imageUrl: String,
    systemEventType: String
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ ride: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for read status
messageSchema.virtual('isRead').get(function() {
  return this.readBy.length > 0;
});

// Method to mark as read
messageSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId, readAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

const Message = mongoose.model('Message', messageSchema);
export default Message;