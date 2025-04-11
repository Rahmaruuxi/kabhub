const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const { auth } = require('../middleware/auth');

// Get all scholarships
router.get('/', async (req, res) => {
  try {
    const { category, search, status = 'open', level, type, sort = 'newest' } = req.query;
    const query = { status };

    if (category) query.category = category;
    if (level) query.level = level;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'deadline') {
      sortOption = { deadline: 1 };
    }

    const scholarships = await Scholarship.find(query)
      .populate('author', 'name profilePicture')
      .sort(sortOption);
    
    res.json(scholarships);
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ message: 'Server error while fetching scholarships' });
  }
});

// Get scholarship by ID
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id)
      .populate('author', 'name profilePicture')
      .populate('applications.applicant', 'name profilePicture');
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    res.json(scholarship);
  } catch (error) {
    console.error('Get scholarship error:', error);
    res.status(500).json({ message: 'Server error while fetching scholarship details' });
  }
});

// Create scholarship
router.post('/', auth, async (req, res) => {
  try {
    const scholarship = new Scholarship({
      ...req.body,
      author: req.user._id
    });
    await scholarship.save();
    await scholarship.populate('author', 'name profilePicture');
    res.status(201).json(scholarship);
  } catch (error) {
    console.error('Create scholarship error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update scholarship
router.put('/:id', auth, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this scholarship' });
    }

    Object.assign(scholarship, req.body);
    await scholarship.save();
    await scholarship.populate('author', 'name profilePicture');
    
    res.json(scholarship);
  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete scholarship
router.delete('/:id', auth, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this scholarship' });
    }

    await scholarship.deleteOne();
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({ message: 'Server error while deleting scholarship' });
  }
});

// Apply for scholarship
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.status !== 'open') {
      return res.status(400).json({ message: 'This scholarship is not accepting applications' });
    }

    // Check if user has already applied
    const hasApplied = scholarship.applications.some(
      app => app.applicant.toString() === req.user._id.toString()
    );

    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }

    scholarship.applications.push({
      applicant: req.user._id,
      message: req.body.message
    });

    await scholarship.save();
    await scholarship.populate('applications.applicant', 'name profilePicture');
    res.json(scholarship);
  } catch (error) {
    console.error('Apply for scholarship error:', error);
    res.status(500).json({ message: 'Server error while applying for scholarship' });
  }
});

// Update application status
router.put('/:id/applications/:applicationId', auth, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (scholarship.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update application status' });
    }

    const application = scholarship.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = req.body.status;
    await scholarship.save();
    await scholarship.populate('applications.applicant', 'name profilePicture');
    
    res.json(scholarship);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error while updating application status' });
  }
});

module.exports = router; 