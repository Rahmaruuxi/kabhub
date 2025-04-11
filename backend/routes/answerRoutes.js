const express = require("express");
const router = express.Router();
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const { createNotification } = require('../utils/notificationUtils');

// Get answers for a question
router.get("/question/:questionId", async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (error) {
    console.error("Get answers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create answer
router.post("/", auth, async (req, res) => {
  try {
    const { content, questionId } = req.body;
    
    // First find the question to ensure it exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Create the answer
    const answer = new Answer({
      content,
      question: questionId,
      author: req.user._id,
    });
    await answer.save();

    // Update question's answers array with just the answer ID
    question.answers.push(answer._id);
    await question.save();

    // Add answer to user's answersGiven array
    const user = await User.findById(req.user._id);
    user.answersGiven.push(answer._id);
    await user.save();

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      await createNotification(
        question.author,
        req.user._id,
        'answer',
        `${user.name} answered your question: "${question.title}"`,
        `/question/${questionId}`,
        req.app.get('io')
      );
    }

    // Populate author details before sending response
    await answer.populate("author", "name profilePicture");

    // Emit socket event for new answer
    const io = req.app.get('io');
    if (io) {
      io.to(`question-${questionId}`).emit("new-answer", answer);
    }

    res.status(201).json(answer);
  } catch (error) {
    console.error("Create answer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update answer
router.put("/:id", auth, async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    answer.content = content || answer.content;
    await answer.save();
    
    // Populate author details before emitting
    await answer.populate("author", "name profilePicture");
    
    // Emit socket event for updated answer
    const io = req.app.get('io');
    io.to(`question-${answer.question}`).emit("answer-updated", answer);

    res.json(answer);
  } catch (error) {
    console.error("Update answer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete answer
router.delete("/:id", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id },
    });

    await answer.remove();
    
    // Emit socket event for deleted answer
    const io = req.app.get('io');
    io.to(`question-${answer.question}`).emit("answer-deleted", answer._id);

    res.json({ message: "Answer deleted" });
  } catch (error) {
    console.error("Delete answer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment to answer
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const comment = {
      content: req.body.content,
      author: req.user._id,
    };

    answer.comments.push(comment);
    await answer.save();
    await answer.populate("comments.author", "name profilePicture");
    
    // Emit socket event for updated answer with new comment
    const io = req.app.get('io');
    io.to(`question-${answer.question}`).emit("answer-updated", answer);

    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Accept answer
router.post("/:id/accept", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const question = await Question.findById(answer.question);

    if (!answer || !question) {
      return res.status(404).json({ message: "Answer or question not found" });
    }

    // Check if user is the question author
    if (question.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the question author can accept an answer" });
    }

    // Update answer and question
    answer.isAccepted = true;
    question.isSolved = true;
    question.solvedBy = answer._id;

    await answer.save();
    await question.save();

    // Update user reputation
    const answerAuthor = await User.findById(answer.author);
    answerAuthor.reputation += 15;
    await answerAuthor.save();

    // Create notification for answer author
    await createNotification(
      answer.author,
      req.user._id,
      'answer_accepted',
      `Your answer to "${question.title}" was accepted!`,
      `/question/${question._id}`,
      req.app.get('io')
    );

    // Populate author details before emitting
    await answer.populate("author", "name profilePicture");
    await question.populate("author", "name profilePicture");
    
    // Emit socket events for updated answer and question
    const io = req.app.get('io');
    io.to(`question-${question._id}`).emit("answer-updated", answer);
    io.to(`question-${question._id}`).emit("question-updated", question);
    io.to("questions").emit("question-updated", question);

    res.json({ answer, question });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upvote answer
router.post("/:id/upvote", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const hasUpvoted = answer.upvotes.includes(req.user._id);
    const hasDownvoted = answer.downvotes.includes(req.user._id);

    if (hasUpvoted) {
      // Remove upvote
      answer.upvotes = answer.upvotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add upvote and remove downvote if exists
      answer.upvotes.push(req.user._id);
      if (hasDownvoted) {
        answer.downvotes = answer.downvotes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      }
    }

    await answer.save();
    
    // Populate author details before emitting
    await answer.populate("author", "name profilePicture");
    
    // Emit socket event for updated answer
    const io = req.app.get('io');
    io.to(`question-${answer.question}`).emit("answer-updated", answer);

    res.json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Downvote answer
router.post("/:id/downvote", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const hasUpvoted = answer.upvotes.includes(req.user._id);
    const hasDownvoted = answer.downvotes.includes(req.user._id);

    if (hasDownvoted) {
      // Remove downvote
      answer.downvotes = answer.downvotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add downvote and remove upvote if exists
      answer.downvotes.push(req.user._id);
      if (hasUpvoted) {
        answer.upvotes = answer.upvotes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      }
    }

    await answer.save();
    
    // Populate author details before emitting
    await answer.populate("author", "name profilePicture");
    
    // Emit socket event for updated answer
    const io = req.app.get('io');
    io.to(`question-${answer.question}`).emit("answer-updated", answer);

    res.json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
