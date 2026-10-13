const Quiz = require('../models/Quiz');

/**
 * Controller xử lý nghiệp vụ Câu hỏi Trắc nghiệm (Quiz)
 */

// GET /api/quiz - Lấy danh sách câu hỏi phân nhóm theo danh mục
async function getAllQuizzes(req, res) {
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
}

// POST /api/quiz - Thêm câu hỏi trắc nghiệm mới
async function createQuiz(req, res) {
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
}

// DELETE /api/quiz/:id - Xóa câu hỏi trắc nghiệm
async function deleteQuiz(req, res) {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }
    res.json({ success: true, message: 'Đã xóa câu hỏi thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllQuizzes,
  createQuiz,
  deleteQuiz
};
