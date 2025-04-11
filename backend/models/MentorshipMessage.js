const mongoose = require('mongoose');

const mentorshipMessageSchema = new mongoose.Schema({
  mentorship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentorship',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
mentorshipMessageSchema.index({ mentorship: 1, createdAt: -1 });

const MentorshipMessage = mongoose.model('MentorshipMessage', mentorshipMessageSchema);

module.exports = MentorshipMessage; 