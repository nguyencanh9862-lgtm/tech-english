const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// GET /api/quiz - Get all quizzes grouped by category
router.get('/', async (req, res) => {
  try {
    const list = await Quiz.find();
    const grouped = {
      vocabulary: [],
      grammar: [],
      listening: [],
      mixed: []
    };

    list.forEach(q => {
      if (grouped[q.category]) {
        grouped[q.category].push({
          _id: q._id,
          q: q.q,
          options: q.options,
          answer: q.answer,
          audio: q.audio
        });
      }
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/quiz - Add quiz question
router.post('/', async (req, res) => {
  try {
    const { category, q, options, answer, audio } = req.body;
    if (!category || !q || !options || answer === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin câu hỏi' });
    }

    const newQuiz = new Quiz({
      category,
      q,
      options,
      answer,
      audio: audio || ''
    });
    await newQuiz.save();
    res.status(201).json({ success: true, message: 'Thêm câu hỏi thành công', data: newQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/quiz/:id - Delete quiz question
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }
    res.json({ success: true, message: 'Đã xóa câu hỏi thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
