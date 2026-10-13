const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// GET /api/stats - Thống kê số lượng bản ghi và tỷ lệ
router.get('/', statsController.getStats);

module.exports = router;
