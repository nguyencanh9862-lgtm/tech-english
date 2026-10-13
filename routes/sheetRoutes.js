const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetController');
const {
  parseGoogleSheetUrl,
  parseCsv,
  cleanHeader,
  mapVocabRow,
  mapCourseRow,
  mapQuizRow
} = require('../utils/sheetParser');

// 1. POST /api/sheets/parse - Đọc và phân tích cấu trúc Google Sheet
router.post('/parse', sheetController.parseSheet);

// 2. POST /api/sheets/sync - Đồng bộ dữ liệu bảng tính vào database
router.post('/sync', sheetController.syncSheet);

// 3. GET /api/sheets/export/:type - Xuất dữ liệu ra file CSV
router.get('/export/:type', sheetController.exportSheet);

// 4. GET /api/sheets/sample/:type - Lấy dữ liệu mẫu có sẵn để demo
router.get('/sample/:type', sheetController.getSampleData);

module.exports = router;
module.exports.parseGoogleSheetUrl = parseGoogleSheetUrl;
module.exports.parseCsv = parseCsv;
module.exports.cleanHeader = cleanHeader;
module.exports.mapVocabRow = mapVocabRow;
module.exports.mapCourseRow = mapCourseRow;
module.exports.mapQuizRow = mapQuizRow;
