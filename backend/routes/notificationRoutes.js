const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationUtils');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    // console.log(`Fetching notifications for user: ${req.user._id}`);
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 });
    // console.log(`Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new notification
router.post('/create', auth, async (req, res) => {
  try {
    const { recipientId, senderId, type, content, link } = req.body;
    
    // console.log('Creating notification with data:', { recipientId, senderId, type, content, link });
    
    // Validate required fields
    if (!recipientId || !senderId || !type || !content || !link) {
      console.error('Missing required fields for notification');
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create notification using the utility function
    const notification = await createNotification(
      recipientId,
      senderId,
      type,
      content,
      link,
      req.app.get('io')
    );
    
    if (!notification) {
      // console.error('Failed to create notification');
      return res.status(500).json({ message: 'Failed to create notification' });
    }
    
    console.log('Notification created successfully:', notification._id);
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    // console.log(`Marking notification ${req.params.id} as read for user ${req.user._id}`);
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      console.error(`Notification not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    console.log(`Notification ${req.params.id} marked as read`);
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    console.log(`Marking all notifications as read for user ${req.user._id}`);
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    console.log(`Marked ${result.nModified} notifications as read`);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`Deleting notification ${req.params.id} for user ${req.user._id}`);
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      console.error(`Notification not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log(`Notification ${req.params.id} deleted successfully`);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 