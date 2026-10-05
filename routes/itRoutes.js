const express = require('express');
const router = express.Router();
const ITCourse = require('../models/ITCourse');

// GET /api/it/courses - Get all IT courses and lessons
router.get('/courses', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    const courses = await ITCourse.find(query).sort({ id: 1 });
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/it/courses/:id - Get single course detail
router.get('/courses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const course = await ITCourse.findOne({ id });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học CNTT' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/it/terms - Get aggregated IT technical vocabulary
router.get('/terms', async (req, res) => {
  try {
    const courses = await ITCourse.find({});
    let allTerms = [];
    courses.forEach(c => {
      if (c.keyVocab && c.keyVocab.length > 0) {
        c.keyVocab.forEach(v => {
          allTerms.push({
            ...v.toObject(),
            courseTitle: c.title,
            courseCategory: c.category
          });
        });
      }
    });
    res.json({ success: true, count: allTerms.length, data: allTerms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
