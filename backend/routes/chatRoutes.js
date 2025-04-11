const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// Get predefined questions
router.get('/predefined-questions', auth, chatController.getPredefinedQuestions);

// AI chat endpoint
router.post('/ai', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const response = await chatController.getGiminAIResponse(history || [{ role: 'user', content: message }]);
    res.json({ message: response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Error getting AI response', error: error.message });
  }
});

// Get all chats for a user
router.get('/', auth, chatController.getUserChats);

// Get a specific chat
router.get('/:chatId', auth, chatController.getChat);

// Create a new chat
router.post('/', auth, chatController.createChat);

// Send a message in a chat
router.post('/:chatId/messages', auth, chatController.sendMessage);

// Delete a chat
router.delete('/:chatId', auth, chatController.deleteChat);

module.exports = router; 