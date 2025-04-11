const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'posts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for post images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');
    
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture')
      .populate('likes', 'name profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Create post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const images = req.files ? req.files.map(file => `/uploads/posts/${file.filename}`) : [];
    
    const post = new Post({
      title,
      content,
      author: req.user._id,
      images
    });

    await post.save();

    // Populate author details
    await post.populate('author', 'name profilePicture');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Update post
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content } = req.body;
    
    // Handle images
    if (req.files && req.files.length > 0) {
      // Delete old images
      post.images.forEach(image => {
        const imagePath = path.join(uploadsDir, path.basename(image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

      // Add new images
      post.images = req.files.map(file => `/uploads/posts/${file.filename}`);
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    // Populate author details
    await post.populate('author', 'name profilePicture');

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete post images
    post.images.forEach(image => {
      const imagePath = path.join(uploadsDir, path.basename(image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Like/Unlike post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    
    // Populate likes array with user details
    await post.populate('likes', 'name profilePicture');
    
    res.json({
      message: likeIndex === -1 ? 'Post liked successfully' : 'Post unliked successfully',
      likes: post.likes,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ 
      message: 'Error updating post like',
      error: error.message 
    });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      author: req.user._id,
    };

    post.comments.push(comment);
    await post.save();

    // Create notification for post author
    if (post.author.toString() !== req.user._id.toString()) {
      const commenter = await User.findById(req.user._id);
      await createNotification(
        post.author,
        req.user._id,
        'comment',
        `${commenter.name} commented on your post: "${post.title}"`,
        `/post/${post._id}`
      );
    }

    await post.populate('comments.author', 'name profilePicture');
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 