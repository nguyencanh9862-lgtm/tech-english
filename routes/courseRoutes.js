const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { extractYouTubeId } = require('../utils/youtube');

// GET /api/courses - Lấy danh sách khóa học
router.get('/', courseController.getAllCourses);

// GET /api/courses/:id - Lấy chi tiết khóa học
router.get('/:id', courseController.getCourseById);

// POST /api/courses - Tạo mới khóa học
router.post('/', courseController.createCourse);

// PUT /api/courses/:id - Cập nhật khóa học
router.put('/:id', courseController.updateCourse);

// DELETE /api/courses/:id - Xóa khóa học
router.delete('/:id', courseController.deleteCourse);

// POST /api/courses/:id/lessons - Thêm bài học video
router.post('/:id/lessons', courseController.addLesson);

// DELETE /api/courses/:id/lessons/:lessonId - Xóa bài học video
router.delete('/:id/lessons/:lessonId', courseController.deleteLesson);

module.exports = router;
module.exports.extractYouTubeId = extractYouTubeId;
