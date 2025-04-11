const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'technical', 'research', 'other']
  },
  provider: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  deadline: {
    type: Date,
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  eligibility: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['full', 'partial', 'tuition', 'living']
  },
  level: {
    type: String,
    required: true,
    enum: ['bachelor', 'master', 'phd', 'diploma', 'certificate']
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'closed', 'pending'],
    default: 'open'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    message: String,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Scholarship', scholarshipSchema); 