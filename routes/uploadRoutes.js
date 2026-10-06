const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');

// Configure upload directory
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images (Validate MIME and Extension strictly)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (allowedMimes.includes(file.mimetype) && (allowedExts.includes(ext) || !ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WEBP, SVG)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/upload - Single image upload
router.post('/upload', (req, res) => {
  const uploadSingle = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]);

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const file = (req.files && (req.files.image?.[0] || req.files.file?.[0])) || req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file hình ảnh cần tải lên' });
    }

    try {
      const fileUrl = `/uploads/${file.filename}`;
      const media = new Media({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl
      });
      await media.save();

      res.status(201).json({
        success: true,
        message: 'Tải ảnh lên thành công',
        url: fileUrl,
        filename: file.filename,
        media
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi lưu thông tin ảnh: ' + error.message });
    }
  });
});

// POST /api/upload/multiple - Multiple images upload
router.post('/upload/multiple', upload.array('images', 12), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 ảnh' });
  }

  try {
    const savedList = [];
    for (const file of req.files) {
      const fileUrl = `/uploads/${file.filename}`;
      const media = new Media({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl
      });
      await media.save();
      savedList.push(media);
    }

    res.status(201).json({
      success: true,
      message: `Đã tải lên thành công ${savedList.length} ảnh`,
      files: savedList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải ảnh: ' + error.message });
  }
});

// GET /api/media - Get all media images
router.get('/media', async (req, res) => {
  try {
    const mediaList = await Media.find().sort({ createdAt: -1 });
    res.json({ success: true, data: mediaList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/media/:filename - Delete image by filename safely
router.delete('/media/:filename', async (req, res) => {
  try {
    const rawFilename = req.params.filename;
    const cleanFilename = path.basename(rawFilename);
    const resolvedPath = path.resolve(uploadDir, cleanFilename);

    // Prevent directory traversal attacks
    if (!resolvedPath.startsWith(path.resolve(uploadDir))) {
      return res.status(400).json({ success: false, message: 'Tên file không hợp lệ' });
    }

    await Media.findOneAndDelete({ filename: cleanFilename });

    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }

    res.json({ success: true, message: 'Đã xóa ảnh thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.fileFilter = fileFilter;
