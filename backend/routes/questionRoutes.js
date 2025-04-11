const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "questions");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all questions with filters
router.get("/filters", async (req, res) => {
  try {
    const { category, course, tag, search, sort = "createdAt" } = req.query;
    const query = {};

    // Apply filters
    if (category) query.category = category;
    if (course) query.course = course;
    if (tag) query.tags = tag;
    if (search) {
      query.$text = { $search: search };
    }

    // Apply sorting
    const sortOptions = {
      createdAt: { createdAt: -1 },
      views: { views: -1 },
      upvotes: { "upvotes.length": -1 },
    };

    const questions = await Question.find(query)
      .sort(sortOptions[sort] || sortOptions.createdAt)
      .populate("author", "name profilePicture")
      .populate({
        path: "answers",
        populate: { path: "author", select: "name profilePicture" },
      });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get question by ID
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "name profilePicture")
      .populate({
        path: "answers",
        populate: { path: "author", select: "name profilePicture" },
      });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create question
router.post("/", auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, tags, category = "General", course } = req.body;
    const question = new Question({
      title,
      content,
      tags: JSON.parse(tags),
      category,
      course,
      author: req.user._id,
      image: req.file ? `/uploads/questions/${req.file.filename}` : null
    });
    await question.save();

    // Add question to user's questionsAsked array
    const user = await User.findById(req.user._id);
    user.questionsAsked.push(question._id);
    await user.save();

    // Populate author details before sending response
    await question.populate("author", "name profilePicture");

    // Emit socket event for new question
    const io = req.app.get("io");
    io.to("questions").emit("new-question", question);

    res.status(201).json(question);
  } catch (error) {
    console.error("Create question error:", error);
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Update question
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content, tags, category, course } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;
    question.category = category || question.category;
    question.course = course || question.course;

    await question.save();

    // Populate author details before emitting
    await question.populate("author", "name profilePicture");

    // Emit socket event for updated question
    const io = req.app.get("io");
    io.to(`question-${question._id}`).emit("question-updated", question);
    io.to("questions").emit("question-updated", question);

    res.json(question);
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete question
router.delete("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user is authorized to delete the question
    if (question.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this question" });
    }

    await Question.deleteOne({ _id: req.params.id });

    // Emit socket event for deleted question
    const io = req.app.get("io");
    io.to(`question-${req.params.id}`).emit("question-deleted", req.params.id);
    io.to("questions").emit("question-deleted", req.params.id);

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ message: "Error deleting question" });
  }
});

// Upvote question
router.post("/:id/upvote", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const hasUpvoted = question.upvotes.includes(req.user._id);
    const hasDownvoted = question.downvotes.includes(req.user._id);

    if (hasUpvoted) {
      // Remove upvote
      question.upvotes = question.upvotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add upvote and remove downvote if exists
      question.upvotes.push(req.user._id);
      if (hasDownvoted) {
        question.downvotes = question.downvotes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      }
    }

    await question.save();

    // Populate author details before emitting
    await question.populate("author", "name profilePicture");

    // Emit socket event for updated question
    const io = req.app.get("io");
    io.to(`question-${question._id}`).emit("question-updated", question);
    io.to("questions").emit("question-updated", question);

    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Downvote question
router.post("/:id/downvote", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const hasUpvoted = question.upvotes.includes(req.user._id);
    const hasDownvoted = question.downvotes.includes(req.user._id);

    if (hasDownvoted) {
      // Remove downvote
      question.downvotes = question.downvotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add downvote and remove upvote if exists
      question.downvotes.push(req.user._id);
      if (hasUpvoted) {
        question.upvotes = question.upvotes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      }
    }

    await question.save();

    // Populate author details before emitting
    await question.populate("author", "name profilePicture");

    // Emit socket event for updated question
    const io = req.app.get("io");
    io.to(`question-${question._id}`).emit("question-updated", question);
    io.to("questions").emit("question-updated", question);

    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add answer to question
router.post("/:id/answers", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.answers.push({
      content,
      author: req.user._id,
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error("Add answer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
