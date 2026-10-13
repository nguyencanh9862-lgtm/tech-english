const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// POST /api/upload - Tải lên 1 ảnh đơn lẻ
router.post('/upload', uploadController.uploadSingle);

// POST /api/upload/multiple - Tải lên nhiều ảnh
router.post('/upload/multiple', uploadController.upload.array('images', 12), uploadController.uploadMultiple);

// GET /api/media - Lấy danh sách toàn bộ ảnh
router.get('/media', uploadController.getAllMedia);

// DELETE /api/media/:filename - Xóa ảnh
router.delete('/media/:filename', uploadController.deleteMedia);

module.exports = router;
module.exports.fileFilter = uploadController.fileFilter;
