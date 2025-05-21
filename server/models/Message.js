import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'recruiter'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
