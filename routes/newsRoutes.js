const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news - Lấy danh sách tin tức
router.get('/', newsController.getAllNews);

// GET /api/news/:id - Lấy chi tiết bài viết tin tức
router.get('/:id', newsController.getNewsById);

// POST /api/news - Tạo bài viết tin tức mới
router.post('/', newsController.createNews);

// PUT /api/news/:id - Cập nhật bài viết tin tức
router.put('/:id', newsController.updateNews);

// DELETE /api/news/:id - Xóa bài viết tin tức
router.delete('/:id', newsController.deleteNews);

module.exports = router;
