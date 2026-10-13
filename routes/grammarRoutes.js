const express = require('express');
const router = express.Router();
const grammarController = require('../controllers/grammarController');

// GET /api/grammar - Lấy danh sách bài học ngữ pháp
router.get('/', grammarController.getAllGrammar);

// POST /api/grammar - Tạo mới bài học ngữ pháp
router.post('/', grammarController.createGrammar);

// PUT /api/grammar/:id - Cập nhật bài học ngữ pháp
router.put('/:id', grammarController.updateGrammar);

// DELETE /api/grammar/:id - Xóa bài học ngữ pháp
router.delete('/:id', grammarController.deleteGrammar);

module.exports = router;
