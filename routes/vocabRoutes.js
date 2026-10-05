const express = require('express');
const router = express.Router();
const Vocabulary = require('../models/Vocabulary');

// GET /api/vocab - Get all vocabulary items
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
      query.$or = [
        { word: { $regex: search, $options: 'i' } },
        { meaning: { $regex: search, $options: 'i' } },
        { example: { $regex: search, $options: 'i' } }
      ];
    }

    const vocabList = await Vocabulary.find(query).sort({ id: 1 });
    res.json({ success: true, count: vocabList.length, data: vocabList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vocab/:id - Get single vocabulary item
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await Vocabulary.findOne({ id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/vocab - Create vocabulary item
router.post('/', async (req, res) => {
  try {
    let { id, word, phonetic, pos, meaning, example, exampleVi, category, level, image } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ success: false, message: 'Từ vựng và nghĩa là bắt buộc' });
    }

    // Auto-generate id if not provided
    if (!id) {
      const highest = await Vocabulary.findOne().sort({ id: -1 });
      id = highest ? highest.id + 1 : 1;
    }

    const exists = await Vocabulary.findOne({ id });
    if (exists) {
      const highest = await Vocabulary.findOne().sort({ id: -1 });
      id = highest ? highest.id + 1 : 1;
    }

    const newVocab = new Vocabulary({
      id,
      word,
      phonetic: phonetic || '',
      pos: pos || 'n',
      meaning,
      example: example || '',
      exampleVi: exampleVi || '',
      category: category || 'daily',
      level: level || 'A1',
      image: image || ''
    });

    await newVocab.save();
    res.status(201).json({ success: true, message: 'Thêm từ vựng thành công', data: newVocab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/vocab/:id - Update vocabulary item
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { word, phonetic, pos, meaning, example, exampleVi, category, level, image } = req.body;

    const updated = await Vocabulary.findOneAndUpdate(
      { id },
      {
        word,
        phonetic,
        pos,
        meaning,
        example,
        exampleVi,
        category,
        level,
        ...(image !== undefined ? { image } : {})
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng' });
    }

    res.json({ success: true, message: 'Cập nhật từ vựng thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/vocab/:id - Delete vocabulary item
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await Vocabulary.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng' });
    }

    res.json({ success: true, message: 'Đã xóa từ vựng', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
