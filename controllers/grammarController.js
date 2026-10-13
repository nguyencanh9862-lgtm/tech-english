const Grammar = require('../models/Grammar');

/**
 * Controller xử lý nghiệp vụ Ngữ pháp (Grammar)
 */

// GET /api/grammar - Lấy danh sách bài học ngữ pháp
async function getAllGrammar(req, res) {
  try {
    const list = await Grammar.find();
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/grammar - Tạo bài học ngữ pháp mới
async function createGrammar(req, res) {
  try {
    const lesson = new Grammar(req.body);
    await lesson.save();
    res.status(201).json({ success: true, message: 'Thêm bài ngữ pháp thành công', data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/grammar/:id - Cập nhật bài học ngữ pháp
async function updateGrammar(req, res) {
  try {
    const updated = await Grammar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    }
    res.json({ success: true, message: 'Cập nhật thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/grammar/:id - Xóa bài học ngữ pháp
async function deleteGrammar(req, res) {
  try {
    const deleted = await Grammar.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    }
    res.json({ success: true, message: 'Đã xóa bài học' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllGrammar,
  createGrammar,
  updateGrammar,
  deleteGrammar
};
