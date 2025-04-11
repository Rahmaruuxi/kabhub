const express = require("express");
const router = express.Router();
const Mentorship = require("../models/Mentorship");
const { auth } = require("../middleware/auth");

// Get all mentorships
router.get("/", async (req, res) => {
  try {
    const mentorships = await Mentorship.find()
      .populate("mentor", "name profilePicture")
      .populate("mentee", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(mentorships);
  } catch (error) {
    console.error("Get mentorships error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all mentorship opportunities with filters
router.get("/filter", async (req, res) => {
  try {
    const { category, search, status = "open" } = req.query;
    const query = { status };

    // Apply filters
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const mentorships = await Mentorship.find(query)
      .sort({ createdAt: -1 })
      .populate("mentor", "name profilePicture")
      .populate("mentee", "name profilePicture");

    res.json(mentorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentorship by ID
router.get("/:id", async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate("mentor", "name profilePicture")
      .populate("mentee", "name profilePicture");

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    res.json(mentorship);
  } catch (error) {
    console.error("Get mentorship error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create mentorship opportunity or request
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      schedule,
      requirements,
      goals,
      message,
      menteeId,
      contactEmail,
      contactPhone,
      communityLink,
    } = req.body;

    // Validate required contact fields
    if (!contactEmail || !contactPhone || !communityLink) {
      return res.status(400).json({
        message: "Contact email, phone, and community link are required",
      });
    }

    // If menteeId is provided, it's a mentorship request
    if (menteeId) {
      const mentorship = new Mentorship({
        mentor: req.user._id,
        mentee: menteeId,
        message: message || "Mentorship request",
        status: "pending",
      });
      await mentorship.save();
      return res.status(201).json(mentorship);
    }

    // Otherwise, it's a mentorship opportunity
    const mentorship = new Mentorship({
      title,
      description,
      category,
      duration,
      schedule,
      requirements: requirements || [],
      goals: goals || [],
      mentor: req.user._id,
      status: "open",
      contactEmail,
      contactPhone,
      communityLink,
    });
    await mentorship.save();
    await mentorship.populate("mentor", "name profilePicture");

    // Add mentorship to user's mentorships array
    req.user.mentorshipsPosted.push(mentorship._id);
    await req.user.save();

    res.status(201).json(mentorship);
  } catch (error) {
    console.error("Create mentorship error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update mentorship status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    mentorship.status = status;
    await mentorship.save();
    res.json(mentorship);
  } catch (error) {
    console.error("Update mentorship error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete mentorship
router.delete("/:id", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await mentorship.deleteOne();
    res.json({ message: "Mentorship deleted" });
  } catch (error) {
    console.error("Delete mentorship error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update mentorship opportunity
router.put("/:id", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this mentorship" });
    }

    // Only allow updating certain fields
    const allowedUpdates = [
      "title",
      "description",
      "category",
      "duration",
      "schedule",
      "requirements",
      "goals",
      "contactEmail",
      "contactPhone",
      "communityLink",
    ];
    const updates = Object.keys(req.body).filter((key) =>
      allowedUpdates.includes(key)
    );

    updates.forEach((update) => {
      mentorship[update] = req.body[update];
    });

    await mentorship.save();
    await mentorship.populate("mentor", "name profilePicture");

    res.json(mentorship);
  } catch (error) {
    console.error("Update mentorship error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete mentorship opportunity
router.delete("/:id", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res
        .status(404)
        .json({ message: "Mentorship opportunity not found" });
    }

    // Check if user is the mentor or admin
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this mentorship" });
    }

    // Remove mentorship from user's mentorshipsPosted array
    req.user.mentorshipsPosted = req.user.mentorshipsPosted.filter(
      (m) => m.toString() !== mentorship._id.toString()
    );
    await req.user.save();

    await Mentorship.findByIdAndDelete(mentorship._id);
    res.json({ message: "Mentorship opportunity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request mentorship
router.post("/:id/request", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res
        .status(404)
        .json({ message: "Mentorship opportunity not found" });
    }

    // Check if mentorship is available
    if (mentorship.status !== "available") {
      return res
        .status(400)
        .json({ message: "This mentorship opportunity is not available" });
    }

    // Check if user has already requested
    const existingRequest = mentorship.requests.find(
      (request) => request.mentee.toString() === req.user._id.toString()
    );
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You have already requested this mentorship" });
    }

    // Add request
    mentorship.requests.push({
      mentee: req.user._id,
      message: req.body.message,
    });
    mentorship.status = "requested";
    await mentorship.save();

    res.json({ message: "Mentorship request submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Accept mentorship request
router.post("/:id/accept-request/:requestId", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res
        .status(404)
        .json({ message: "Mentorship opportunity not found" });
    }

    // Check if user is the mentor
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept requests" });
    }

    const request = mentorship.requests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update request status
    request.status = "accepted";

    // Update mentorship status and mentee
    mentorship.status = "accepted";
    mentorship.mentee = request.mentee;

    // Reject other requests
    mentorship.requests.forEach((req) => {
      if (req._id.toString() !== request._id.toString()) {
        req.status = "rejected";
      }
    });

    await mentorship.save();
    res.json({ message: "Mentorship request accepted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject mentorship request
router.post("/:id/reject-request/:requestId", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res
        .status(404)
        .json({ message: "Mentorship opportunity not found" });
    }

    // Check if user is the mentor
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject requests" });
    }

    const request = mentorship.requests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await mentorship.save();

    res.json({ message: "Mentorship request rejected successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete mentorship
router.post("/:id/complete", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res
        .status(404)
        .json({ message: "Mentorship opportunity not found" });
    }

    // Check if user is the mentor or mentee
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to complete this mentorship" });
    }

    mentorship.status = "completed";
    await mentorship.save();

    res.json({ message: "Mentorship completed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel mentorship
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res
        .status(404)
        .json({ message: "Mentorship opportunity not found" });
    }

    // Check if user is the mentor or mentee
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this mentorship" });
    }

    mentorship.status = "cancelled";
    await mentorship.save();

    res.json({ message: "Mentorship cancelled successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
