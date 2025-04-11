const express = require("express");
const router = express.Router();
const MentorshipMessage = require("../models/MentorshipMessage");
const Mentorship = require("../models/Mentorship");
const { auth } = require("../middleware/auth");
const { createNotification } = require('../utils/notificationUtils');

// Get all messages for a mentorship
router.get("/mentorship/:mentorshipId", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    
    // Check if user is the mentor or mentee
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }
    
    const messages = await MentorshipMessage.find({ mentorship: req.params.mentorshipId })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: 1 });
      
    res.json(messages);
  } catch (error) {
    console.error("Get mentorship messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send a message in a mentorship
router.post("/", auth, async (req, res) => {
  try {
    const { mentorshipId, content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    
    // Check if user is the mentor or mentee
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to send messages in this mentorship" });
    }
    
    // Check if mentorship is active
    if (mentorship.status !== "accepted") {
      return res.status(400).json({ message: "Cannot send messages in a non-active mentorship" });
    }
    
    const message = new MentorshipMessage({
      mentorship: mentorshipId,
      sender: req.user._id,
      content
    });
    
    await message.save();
    await message.populate("sender", "name profilePicture");
    
    // Determine recipient for notification
    const recipientId = mentorship.mentor.toString() === req.user._id.toString() 
      ? mentorship.mentee 
      : mentorship.mentor;
    
    // Create notification for recipient
    await createNotification(
      recipientId,
      req.user._id,
      'mentorship_message',
      `New message in your mentorship: "${mentorship.title}"`,
      `/mentorship/${mentorshipId}`,
      req.app.get('io')
    );
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`mentorship-${mentorshipId}`).emit("new-message", message);
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Send mentorship message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark messages as read
router.put("/read", auth, async (req, res) => {
  try {
    const { mentorshipId } = req.body;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    
    // Check if user is the mentor or mentee
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to mark messages as read" });
    }
    
    // Mark all unread messages as read
    await MentorshipMessage.updateMany(
      { 
        mentorship: mentorshipId, 
        sender: { $ne: req.user._id },
        read: false 
      },
      { read: true }
    );
    
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread message count
router.get("/unread/:mentorshipId", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    
    // Check if user is the mentor or mentee
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view unread count" });
    }
    
    const count = await MentorshipMessage.countDocuments({
      mentorship: req.params.mentorshipId,
      sender: { $ne: req.user._id },
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 