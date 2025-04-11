const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationUtils');

// Get conversation with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    console.log('Fetching messages for users:', req.user._id, req.params.userId);
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
    .populate('sender', 'name profilePicture')
    .populate('recipient', 'name profilePicture')
    .sort({ createdAt: 1 });

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      senderId: msg.sender._id,
      recipientId: msg.recipient._id,
      createdAt: msg.createdAt,
      read: msg.read
    }));

    console.log('Sending transformed messages:', transformedMessages);
    res.json(transformedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message to a user
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received message request:', req.body);
    const { recipientId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content: content.trim()
    });

    await message.save();

    // Transform message to match frontend expectations
    const transformedMessage = {
      _id: message._id,
      content: message.content,
      senderId: message.sender,
      recipientId: message.recipient,
      createdAt: message.createdAt,
      read: message.read
    };

    console.log('Sending transformed message:', transformedMessage);

    // Create notification for recipient
    await createNotification(
      recipientId,
      req.user._id,
      'message',
      content.trim(),
      null,
      req.app.get('io')
    );

    res.status(201).json(transformedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:senderId', auth, async (req, res) => {
  try {
    const updatedMessages = await Message.updateMany(
      {
        sender: req.params.senderId,
        recipient: req.user._id,
        read: false
      },
      { read: true }
    );

    if (updatedMessages.modifiedCount > 0) {
      const io = req.app.get('io');
      if (io) {
        io.to(req.params.senderId.toString()).emit('messages_marked_read', {
          readBy: req.user._id,
          timestamp: new Date()
        });
      }
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count from a specific user
router.get('/unread/:senderId', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      sender: req.params.senderId,
      recipient: req.user._id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 