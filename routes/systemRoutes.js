const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// GET /api/health - Trạng thái hoạt động của hệ thống
router.get('/health', systemController.getHealth);

module.exports = router;
