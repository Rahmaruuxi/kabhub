const express = require("express");
const router = express.Router();
const Opportunity = require("../models/Opportunity");
const { auth } = require("../middleware/auth");

// Get all opportunities
router.get("/", async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (error) {
    console.error("Get opportunities error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get opportunity by ID
router.get("/:id", async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      "author",
      "name profilePicture"
    );

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.json(opportunity);
  } catch (error) {
    console.error("Get opportunity error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create opportunity
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      company,
      location,
      requirements,
      deadline,
      contactEmail,
      contactPhone,
      website,
      salary,
      benefits,
    } = req.body;

    const opportunity = new Opportunity({
      title,
      description,
      type,
      company,
      location,
      requirements,
      deadline,
      contactEmail,
      contactPhone,
      website,
      salary,
      benefits,
      author: req.user._id,
    });

    await opportunity.save();
    res.status(201).json(opportunity);
  } catch (error) {
    console.error("Create opportunity error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update opportunity
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      company,
      location,
      requirements,
      deadline,
      contactEmail,
      contactPhone,
      website,
      salary,
      benefits,
    } = req.body;

    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (opportunity.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.type = type || opportunity.type;
    opportunity.company = company || opportunity.company;
    opportunity.location = location || opportunity.location;
    opportunity.requirements = requirements || opportunity.requirements;
    opportunity.deadline = deadline || opportunity.deadline;
    opportunity.contactEmail = contactEmail || opportunity.contactEmail;
    opportunity.contactPhone = contactPhone || opportunity.contactPhone;
    opportunity.website = website || opportunity.website;
    opportunity.salary = salary || opportunity.salary;
    opportunity.benefits = benefits || opportunity.benefits;

    await opportunity.save();
    res.json(opportunity);
  } catch (error) {
    console.error("Update opportunity error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete opportunity
router.delete("/:id", auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (opportunity.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this opportunity" });
    }

    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Delete opportunity error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Apply for opportunity
router.post("/:id/apply", auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Check if user has already applied
    if (opportunity.applications.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already applied for this opportunity" });
    }

    // Add user to applications array
    opportunity.applications.push(req.user._id);
    await opportunity.save();

    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
