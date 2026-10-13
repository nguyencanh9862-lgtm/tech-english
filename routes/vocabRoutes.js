const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocabController');

// GET /api/vocab - Lấy danh sách từ vựng
router.get('/', vocabController.getAllVocab);

// GET /api/vocab/:id - Lấy chi tiết từ vựng
router.get('/:id', vocabController.getVocabById);

// POST /api/vocab - Thêm mới từ vựng
router.post('/', vocabController.createVocab);

// PUT /api/vocab/:id - Cập nhật từ vựng
router.put('/:id', vocabController.updateVocab);

// DELETE /api/vocab/:id - Xóa từ vựng
router.delete('/:id', vocabController.deleteVocab);

module.exports = router;
