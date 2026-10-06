const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Helper to extract YouTube Video ID
function extractYouTubeId(url) {
  if (!url) return '';
  url = String(url).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}

// GET /api/courses - Get all courses with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (level && level !== 'all') {
      query.level = level;
    }

    if (search) {
      const { escapeRegex } = require('../middleware/security');
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { titleEn: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { instructor: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query).sort({ id: 1 });
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/courses/:id - Get single course details
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const course = await Course.findOneAndUpdate(
      { id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học tiếng Anh' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses - Create new course
router.post('/', async (req, res) => {
  try {
    let {
      id,
      title,
      titleEn,
      category,
      level,
      description,
      instructor,
      thumbnail,
      youtubeUrl,
      badge,
      lessons
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và mô tả khóa học là bắt buộc' });
    }

    // Auto generate ID if not given
    if (!id) {
      const highest = await Course.findOne().sort({ id: -1 });
      id = highest ? highest.id + 1 : 1;
    }

    const mainYtId = extractYouTubeId(youtubeUrl);

    // Format lessons array
    let parsedLessons = [];
    if (Array.isArray(lessons) && lessons.length > 0) {
      parsedLessons = lessons.map((l, index) => {
        const lessonYtId = extractYouTubeId(l.youtubeUrl) || mainYtId;
        return {
          id: l.id || index + 1,
          title: l.title || `Bài học ${index + 1}`,
          youtubeUrl: l.youtubeUrl || youtubeUrl,
          youtubeId: lessonYtId,
          duration: l.duration || '10:00',
          description: l.description || '',
          order: l.order || index + 1,
          vocabularies: Array.isArray(l.vocabularies) ? l.vocabularies : []
        };
      });
    } else if (youtubeUrl) {
      // Auto create lesson 1 from main YouTube URL
      parsedLessons = [{
        id: 1,
        title: 'Bài 1: Khởi động & Bài giảng chính',
        youtubeUrl: youtubeUrl,
        youtubeId: mainYtId,
        duration: '15:00',
        description: 'Bài học video nhập môn và hướng dẫn thực hành.',
        order: 1,
        vocabularies: []
      }];
    }

    // Auto thumbnail from YouTube if not provided
    if (!thumbnail && mainYtId) {
      thumbnail = `https://img.youtube.com/vi/${mainYtId}/hqdefault.jpg`;
    }

    const newCourse = new Course({
      id,
      title,
      titleEn: titleEn || '',
      category: category || 'communication',
      level: level || 'Cơ bản (A1-A2)',
      description,
      instructor: instructor || 'EnglishMaster Team',
      thumbnail: thumbnail || '',
      youtubeUrl: youtubeUrl || '',
      youtubeId: mainYtId,
      badge: badge || 'Mới nhất',
      views: 0,
      rating: 5.0,
      lessons: parsedLessons
    });

    await newCourse.save();
    res.status(201).json({ success: true, data: newCourse, message: 'Tạo khóa học thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/courses/:id - Update course
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = { ...req.body };

    if (updates.youtubeUrl) {
      updates.youtubeId = extractYouTubeId(updates.youtubeUrl);
      if (!updates.thumbnail && updates.youtubeId) {
        updates.thumbnail = `https://img.youtube.com/vi/${updates.youtubeId}/hqdefault.jpg`;
      }
    }

    if (Array.isArray(updates.lessons)) {
      updates.lessons = updates.lessons.map((l, index) => ({
        id: l.id || index + 1,
        title: l.title || `Bài ${index + 1}`,
        youtubeUrl: l.youtubeUrl,
        youtubeId: extractYouTubeId(l.youtubeUrl),
        duration: l.duration || '10:00',
        description: l.description || '',
        order: l.order || index + 1,
        vocabularies: Array.isArray(l.vocabularies) ? l.vocabularies : []
      }));
    }

    const course = await Course.findOneAndUpdate({ id }, updates, { new: true });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học để cập nhật' });
    }

    res.json({ success: true, data: course, message: 'Cập nhật khóa học thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/courses/:id - Delete course
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const course = await Course.findOneAndDelete({ id });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học để xóa' });
    }

    res.json({ success: true, message: 'Đã xóa khóa học thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses/:id/lessons - Add a video lesson to course
router.post('/:id/lessons', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, youtubeUrl, duration, description, vocabularies } = req.body;

    if (!title || !youtubeUrl) {
      return res.status(400).json({ success: false, message: 'Tên bài học và link YouTube là bắt buộc' });
    }

    const course = await Course.findOne({ id });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    const nextLessonId = course.lessons.length > 0 ? Math.max(...course.lessons.map(l => l.id)) + 1 : 1;
    const lessonYtId = extractYouTubeId(youtubeUrl);

    const newLesson = {
      id: nextLessonId,
      title,
      youtubeUrl,
      youtubeId: lessonYtId,
      duration: duration || '10:00',
      description: description || '',
      order: course.lessons.length + 1,
      vocabularies: Array.isArray(vocabularies) ? vocabularies : []
    };

    course.lessons.push(newLesson);
    await course.save();

    res.status(201).json({ success: true, data: course, newLesson, message: 'Đã thêm bài học video thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/courses/:id/lessons/:lessonId - Delete a lesson from course
router.delete('/:id/lessons/:lessonId', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lessonId = parseInt(req.params.lessonId);

    const course = await Course.findOne({ id });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    course.lessons = course.lessons.filter(l => l.id !== lessonId);
    await course.save();

    res.json({ success: true, data: course, message: 'Đã xóa bài học thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.extractYouTubeId = extractYouTubeId;
