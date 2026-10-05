const express = require('express');
const router = express.Router();
const News = require('../models/News');

// GET /api/news - Get all news with optional filtering & search
router.get('/', async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let q = News.find(query).sort({ id: 1 });
    if (limit) {
      q = q.limit(parseInt(limit));
    }

    const newsList = await q.exec();
    res.json({ success: true, count: newsList.length, data: newsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/news/:id - Get news detail by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const article = await News.findOneAndUpdate(
      { id },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết tin tức' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/news - Create new news article
router.post('/', async (req, res) => {
  try {
    let { title, summary, content, category, categoryLabel, image, readTime, author, keyVocab } = req.body;

    if (!title || !summary || !content) {
      return res.status(400).json({ success: false, message: 'Tiêu đề, tóm tắt và nội dung là bắt buộc' });
    }

    const highest = await News.findOne().sort({ id: -1 });
    const id = highest ? highest.id + 1 : 1;

    const newArticle = new News({
      id,
      title,
      summary,
      content,
      category: category || 'ai',
      categoryLabel: categoryLabel || 'Công nghệ',
      image: image || '',
      readTime: readTime || '5 phút đọc',
      author: author || 'Ban biên tập',
      keyVocab: keyVocab || []
    });

    await newArticle.save();
    res.status(201).json({ success: true, message: 'Tạo bài viết tin tức thành công', data: newArticle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/news/:id - Update news article
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await News.findOneAndUpdate(
      { id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    res.json({ success: true, message: 'Cập nhật thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/news/:id - Delete news article
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await News.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    res.json({ success: true, message: 'Đã xóa bài viết thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
