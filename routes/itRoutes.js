const express = require('express');
const router = express.Router();
const itController = require('../controllers/itController');

// GET /api/it/courses - Lấy danh sách khóa học và bài học CNTT
router.get('/courses', itController.getITCourses);

// GET /api/it/courses/:id - Lấy chi tiết khóa học CNTT
router.get('/courses/:id', itController.getITCourseById);

// GET /api/it/terms - Lấy danh sách thuật ngữ tiếng Anh CNTT tổng hợp
router.get('/terms', itController.getITTerms);

module.exports = router;
