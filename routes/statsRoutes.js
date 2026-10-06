const express = require('express');
const router = express.Router();
const Vocabulary = require('../models/Vocabulary');
const Grammar = require('../models/Grammar');
const Quiz = require('../models/Quiz');
const Media = require('../models/Media');
const User = require('../models/User');
const Course = require('../models/Course');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const [vocabCount, grammarCount, quizCount, mediaCount, userCount, courseCount] = await Promise.all([
      Vocabulary.countDocuments(),
      Grammar.countDocuments(),
      Quiz.countDocuments(),
      Media.countDocuments(),
      User.countDocuments(),
      Course.countDocuments()
    ]);

    // Group vocabulary by category & level
    const catStats = await Vocabulary.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const lvlStats = await Vocabulary.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        vocabCount,
        grammarCount,
        quizCount,
        mediaCount,
        userCount,
        courseCount,
        categories: catStats,
        levels: lvlStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
