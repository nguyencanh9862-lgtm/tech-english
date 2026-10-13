const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// GET /api/quiz - Lấy danh sách câu hỏi phân nhóm theo danh mục
router.get('/', quizController.getAllQuizzes);

// POST /api/quiz - Thêm câu hỏi trắc nghiệm mới
router.post('/', quizController.createQuiz);

// DELETE /api/quiz/:id - Xóa câu hỏi trắc nghiệm
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;
