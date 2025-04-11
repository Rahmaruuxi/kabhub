const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (recipientId, senderId, type, content, link, io) => {
  try {
    console.log(`Creating notification: recipient=${recipientId}, sender=${senderId}, type=${type}`);
    
    // Get sender details
    const sender = await User.findById(senderId).select('name profilePicture');
    if (!sender) {
      console.error(`Sender not found: ${senderId}`);
      return null;
    }
    
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      content,
      link
    });
    
    await notification.save();
    console.log(`Notification created: ${notification._id}`);

    // Populate sender details
    await notification.populate('sender', 'name profilePicture');

    // Emit socket event if io is provided
    if (io) {
      console.log(`Emitting new-notification event to user: ${recipientId}`);
      io.to(recipientId.toString()).emit('new-notification', notification);
    } else {
      console.log('Socket.io instance not provided, skipping real-time notification');
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  createNotification
}; 