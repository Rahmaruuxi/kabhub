const mongoose = require("mongoose");

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["programming", "design", "business", "marketing", "other"],
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  schedule: {
    type: String,
    required: true,
  },
  requirements: [
    {
      type: String,
    },
  ],
  goals: [
    {
      type: String,
    },
  ],
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ["open", "pending", "accepted", "rejected", "completed"],
    default: "open",
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  contactPhone: {
    type: String,
    trim: true,
    required: true,
  },
  communityLink: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search functionality
mentorshipSchema.index({ title: "text", description: "text", category: 1 });

const Mentorship = mongoose.model("Mentorship", mentorshipSchema);

module.exports = Mentorship;
