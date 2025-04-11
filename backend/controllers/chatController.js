const Chat = require('../models/Chat');
const axios = require('axios');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validationResult } = require('express-validator');
const Opportunity = require('../models/Opportunity');
const Mentorship = require('../models/Mentorship');
const Post = require('../models/Post');
const Question = require('../models/Question');
const User = require('../models/User');

class ChatController {
  constructor() {
    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Add message processing lock and response cache with TTL
    this.processingMessages = new Set();
    this.responseCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Add cache cleanup interval
    setInterval(() => this.cleanupCache(), 60 * 1000); // Clean every minute

    // Define keywords for different types of queries
    this.queryKeywords = {
      about: {
        en: ['about', 'what is', 'tell me about', 'describe'],
        ar: ['ما هو', 'اخبرني عن', 'عن']
      },
      opportunity: {
        en: ['opportunity', 'opportunities', 'scholarship', 'scholarships'],
        ar: ['فرصة', 'فرص', 'منحة', 'منح']
      },
      mentorship: {
        en: ['mentorship', 'course', 'training', 'courses'],
        ar: ['دورة', 'تدريب', 'دورات', 'تدريبات']
      },
      post: {
        en: ['post', 'posts', 'article', 'articles'],
        ar: ['منشور', 'منشورات', 'مقال', 'مقالات']
      },
      question: {
        en: ['question', 'questions', 'ask', 'inquiry'],
        ar: ['سؤال', 'أسئلة', 'استفسار', 'استفسارات']
      }
    };

    // Define action keywords
    this.actionKeywords = {
      count: {
        en: ['how many', 'number', 'count', 'total'],
        ar: ['كم عدد', 'عدد', 'كم', 'مجموع']
      },
      category: {
        en: ['category', 'categories', 'type', 'types'],
        ar: ['تصنيف', 'تصنيفات', 'نوع', 'أنواع']
      },
      view: {
        en: ['view', 'show', 'list', 'display'],
        ar: ['عرض', 'اظهار', 'مشاهدة', 'قائمة']
      }
    };
    
    // Define predefined questions in English
    this.predefinedQuestions = [
      // About Section
      {
        id: 'about_kaabhub',
        question: 'What is KaabHub?',
        type: 'about'
      },
      // Quick Questions
      {
        id: 'quick_posts_count',
        question: 'How many posts are available?',
        type: 'post'
      },
      {
        id: 'quick_questions_count',
        question: 'How many questions are available?',
        type: 'question'
      },
      {
        id: 'quick_opportunities_count',
        question: 'How many opportunities are available?',
        type: 'opportunity'
      },
      {
        id: 'quick_scholarships_count',
        question: 'How many scholarships are available in the scholarships section?',
        type: 'opportunity'
      },
      {
        id: 'quick_mentorship_count',
        question: 'How many courses are available in the mentorship section?',
        type: 'mentorship'
      },
      // Opportunities Questions
      {
        id: 'opportunities_count',
        question: 'How many opportunities are available?',
        type: 'opportunity'
      },
      {
        id: 'opportunities_categories',
        question: 'What are the available opportunity categories?',
        type: 'opportunity'
      },
      {
        id: 'opportunities_by_category',
        question: 'What opportunities are available in [category]?',
        type: 'opportunity'
      },
      {
        id: 'opportunity_details',
        question: 'Tell me more about [opportunity title]',
        type: 'opportunity'
      },
      {
        id: 'view_opportunities',
        question: 'View all opportunities',
        type: 'opportunity'
      },
      // Mentorship Questions
      {
        id: 'mentorships_count',
        question: 'How many courses are available?',
        type: 'mentorship'
      },
      {
        id: 'mentorships_categories',
        question: 'What are the available course categories?',
        type: 'mentorship'
      },
      {
        id: 'mentorships_by_category',
        question: 'What courses are available in [category]?',
        type: 'mentorship'
      },
      {
        id: 'mentorship_details',
        question: 'Tell me more about [course name]',
        type: 'mentorship'
      },
      {
        id: 'view_mentorships',
        question: 'View all courses',
        type: 'mentorship'
      },
      // Posts Questions
      {
        id: 'posts_count',
        question: 'How many posts are available?',
        type: 'post'
      },
      {
        id: 'posts_categories',
        question: 'What are the available post categories?',
        type: 'post'
      },
      {
        id: 'posts_by_category',
        question: 'What posts are available in [category]?',
        type: 'post'
      },
      {
        id: 'post_details',
        question: 'Tell me more about [post title]',
        type: 'post'
      },
      {
        id: 'view_posts',
        question: 'View all posts',
        type: 'post'
      },
      // Questions Questions
      {
        id: 'questions_count',
        question: 'How many questions are available?',
        type: 'question'
      },
      {
        id: 'questions_categories',
        question: 'What are the available question categories?',
        type: 'question'
      },
      {
        id: 'questions_by_category',
        question: 'What questions are available in [category]?',
        type: 'question'
      },
      {
        id: 'question_details',
        question: 'Tell me more about [question title]',
        type: 'question'
      },
      {
        id: 'view_questions',
        question: 'View all questions',
        type: 'question'
      }
    ];
    
    // Define static responses for about queries
    this.aboutResponses = {
      kaabhub: `KaabHub is a comprehensive platform designed to connect students with opportunities, mentorship programs, and educational resources. Here's what we offer:

1. Opportunities & Scholarships:
   - Access to various scholarships and educational opportunities
   - Regular updates on new opportunities
   - Easy application process

2. Mentorship Programs:
   - Connect with experienced mentors
   - Access to training courses and workshops
   - Professional development resources

3. Community Features:
   - Q&A section for student inquiries
   - Discussion forums and posts
   - Knowledge sharing platform

Visit our different sections to explore more:
- <a href="/opportunities" class="text-[#136269] hover:underline">Opportunities</a>
- <a href="/mentorships" class="text-[#136269] hover:underline">Mentorship Programs</a>
- <a href="/posts" class="text-[#136269] hover:underline">Community Posts</a>
- <a href="/questions" class="text-[#136269] hover:underline">Q&A Section</a>`
    };

    // Bind methods
    this.getUserChats = this.getUserChats.bind(this);
    this.getChat = this.getChat.bind(this);
    this.createChat = this.createChat.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.deleteChat = this.deleteChat.bind(this);
    this.getGiminAIResponse = this.getGiminAIResponse.bind(this);
    this.getPredefinedQuestions = this.getPredefinedQuestions.bind(this);
  }

  async getUserChats(req, res) {
    try {
      const userId = req.user.id;
      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'name email profilePicture')
        .sort({ lastMessage: -1 });
      
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chats', error: error.message });
    }
  }

  async getChat(req, res) {
    try {
      const chatId = req.params.chatId;
      const userId = req.user.id;

      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      }).populate('participants', 'name email profilePicture')
        .populate('messages.sender', 'name email profilePicture');

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Mark all unread messages as read
      await Chat.updateMany(
        { _id: chatId, 'messages.read': false, 'messages.sender': { $ne: userId } },
        { $set: { 'messages.$[elem].read': true } },
        { arrayFilters: [{ 'elem.read': false, 'elem.sender': { $ne: userId } }] }
      );

      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chat', error: error.message });
    }
  }

  async createChat(req, res) {
    try {
      const { participantId } = req.body;
      const userId = req.user.id;

      // Check if chat already exists between these users
      const existingChat = await Chat.findOne({
        participants: { $all: [userId, participantId] }
      });

      if (existingChat) {
        return res.json(existingChat);
      }

      // Create new chat
      const newChat = new Chat({
        participants: [userId, participantId],
        messages: []
      });

      await newChat.save();
      
      // Populate participant details
      const populatedChat = await Chat.findById(newChat._id)
        .populate('participants', 'name email profilePicture');

      // Notify the other participant through socket
      const io = req.app.get('io');
      io.to(participantId).emit('new_chat', populatedChat);

      res.status(201).json(populatedChat);
    } catch (error) {
      res.status(500).json({ message: 'Error creating chat', error: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const chatId = req.params.chatId;
      const userId = req.user.id;
      const { content } = req.body;

      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Add new message
      const newMessage = {
        sender: userId,
        content,
        timestamp: new Date(),
        read: false
      };

      chat.messages.push(newMessage);
      chat.lastMessage = new Date();
      await chat.save();

      // Populate sender details for the new message
      const populatedChat = await Chat.findById(chat._id)
        .populate('participants', 'name email profilePicture')
        .populate('messages.sender', 'name email profilePicture');

      const io = req.app.get('io');
      
      // Emit to all participants in the chat
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== userId) {
          io.to(`chat_${chatId}`).emit('receive_message', {
            chatId,
            message: newMessage,
            sender: req.user
          });
        }
      });

      res.json(populatedChat);
    } catch (error) {
      res.status(500).json({ message: 'Error sending message', error: error.message });
    }
  }

  async deleteChat(req, res) {
    try {
      const chatId = req.params.chatId;
      const userId = req.user.id;

      const chat = await Chat.findOneAndDelete({
        _id: chatId,
        participants: userId
      });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting chat', error: error.message });
    }
  }

  // Get predefined questions
  async getPredefinedQuestions(req, res) {
    try {
      res.json(this.predefinedQuestions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching predefined questions', error: error.message });
    }
  }

  // Add new method for cache cleanup
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.responseCache.delete(key);
      }
    }
  }

  // Add new method to check keywords
  checkKeywords(text, type, action) {
    const keywords = action ? this.actionKeywords[action] : this.queryKeywords[type];
    const lowercaseText = text.toLowerCase();
    return [...keywords.en, ...keywords.ar].some(keyword => 
      lowercaseText.includes(keyword.toLowerCase())
    );
  }

  // Add new method to get response based on type
  async getTypeResponse(type, userMessage) {
    let Model;
    let urlPath;
    
    switch(type) {
      case 'opportunity':
        Model = Opportunity;
        urlPath = 'opportunities';
        break;
      case 'mentorship':
        Model = Mentorship;
        urlPath = 'mentorships';
        break;
      case 'post':
        Model = Post;
        urlPath = 'posts';
        break;
      case 'question':
        Model = Question;
        urlPath = 'questions';
        break;
      default:
        throw new Error('Invalid type');
    }

    const items = await Model.find({});
    const categories = [...new Set(items.map(item => item.category))].filter(Boolean);

    if (this.checkKeywords(userMessage, type, 'count')) {
      return `There are currently ${items.length} ${type}s available. You can view them all at <a href="/${urlPath}" class="text-[#136269] hover:underline">View ${type}s</a>.`;
    }

    if (this.checkKeywords(userMessage, type, 'category')) {
      if (categories.length === 0) {
        return `No categories are currently available for ${type}s. You can view all ${type}s at <a href="/${urlPath}" class="text-[#136269] hover:underline">View ${type}s</a>.`;
      }
      return `Available ${type} categories are: ${categories.join(', ')}. Browse all ${type}s at <a href="/${urlPath}" class="text-[#136269] hover:underline">View ${type}s</a>.`;
    }

    return `You can view all available ${type}s at <a href="/${urlPath}" class="text-[#136269] hover:underline">View ${type}s</a>.`;
  }

  async getGiminAIResponse(messages) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Google Gemini API key is missing in environment variables");
      }

      if (!messages || messages.length === 0) {
        throw new Error("No messages provided for chat");
      }

      // Get the last user message
      const userMessage = messages[messages.length - 1]?.content;
      if (!userMessage) {
        throw new Error("No user message found in chat history");
      }

      // Check cache with timestamp
      const cacheKey = `${userMessage}-${messages.length}`;
      if (this.responseCache.has(cacheKey)) {
        const cached = this.responseCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTTL) {
          return cached.response;
        }
        this.responseCache.delete(cacheKey);
      }

      // Check if this is an about query
      if (this.checkKeywords(userMessage, 'about')) {
        const lowercaseMessage = userMessage.toLowerCase();
        if (lowercaseMessage.includes('kaabhub') || 
            lowercaseMessage.includes('platform') || 
            lowercaseMessage.includes('website')) {
          const response = this.aboutResponses.kaabhub;
          this.responseCache.set(cacheKey, {
            response,
            timestamp: Date.now()
          });
          return response;
        }
      }

      // Check for different types of queries
      for (const type of Object.keys(this.queryKeywords)) {
        if (this.checkKeywords(userMessage, type)) {
          const response = await this.getTypeResponse(type, userMessage);
          this.responseCache.set(cacheKey, {
            response,
            timestamp: Date.now()
          });
          return response;
        }
      }

      // Map roles to Gemini-compatible roles
      const mapRole = (role) => {
        switch (role) {
          case 'user':
            return 'user';
          case 'assistant':
            return 'model';
          default:
            return 'user';
        }
      };

      // Filter out any duplicate messages
      const uniqueMessages = messages.reduce((acc, msg) => {
        const isDuplicate = acc.some(m => 
          m.content === msg.content && 
          m.role === msg.role && 
          Math.abs(new Date(m.timestamp) - new Date(msg.timestamp)) < 1000
        );
        if (!isDuplicate) {
          acc.push(msg);
        }
        return acc;
      }, []);

      // Add system instructions for specific queries
      const systemInstructions = `You are a helpful assistant for a student platform. 
        If the user asks about opportunities or mentorships, provide specific information from the context.
        For other general questions, provide helpful responses in English.
        Always respond in English.`;

      // Start a chat session with system instructions
      const chatSession = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemInstructions }]
          },
          ...uniqueMessages.map(msg => ({
            role: mapRole(msg.role),
            parts: [{ text: msg.content }]
          }))
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 40
        }
      });

      const result = await chatSession.sendMessage(userMessage);
      const response = result.response;
      
      if (!response || !response.text) {
        throw new Error("Invalid response from Gemini API");
      }

      // Cache the response
      this.responseCache.set(cacheKey, {
        response: response.text(),
        timestamp: Date.now()
      });
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Failed to get response from Gemini API: ${error.message}`);
    }
  }
}

module.exports = new ChatController();
