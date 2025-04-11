const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const auth = require('../middleware/auth');

// Get all opportunities
router.get('/', async (req, res) => {
  try {
    const { type, location, search } = req.query;
    let query = { status: 'active' };

    if (type) query.type = type;
    if (location) query.location = location;
    if (search) {
      query.$text = { $search: search };
    }

    const opportunities = await Opportunity.find(query)
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single opportunity
router.get('/:id', async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('applications.user', 'name email');

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Increment views
    opportunity.views += 1;
    await opportunity.save();

    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new opportunity
router.post('/', auth, async (req, res) => {
  try {
    const opportunity = new Opportunity({
      ...req.body,
      author: req.user._id
    });

    await opportunity.save();
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update opportunity
router.put('/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if user is the author
    if (opportunity.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this opportunity' });
    }

    Object.assign(opportunity, req.body);
    await opportunity.save();

    res.json(opportunity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete opportunity
router.delete('/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if user is the author
    if (opportunity.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this opportunity' });
    }

    await opportunity.remove();
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply for opportunity
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if already applied
    const alreadyApplied = opportunity.applications.some(
      app => app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this opportunity' });
    }

    opportunity.applications.push({
      user: req.user._id
    });

    await opportunity.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 