const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/auth/config - Cấu hình xác thực công khai
router.get('/config', authController.getConfig);

// POST /api/auth/google - Đăng nhập / đăng ký bằng tài khoản Google
router.post('/google', authController.googleAuth);

// POST /api/auth/register - Đăng ký tài khoản nội bộ
router.post('/register', authController.register);

// POST /api/auth/login - Đăng nhập tài khoản nội bộ
router.post('/login', authController.login);

// GET /api/auth/me - Lấy hồ sơ người dùng hiện tại (yêu cầu đăng nhập)
router.get('/me', authenticateToken, authController.getMe);

// PUT /api/auth/progress - Đồng bộ tiến độ học tập (yêu cầu đăng nhập)
router.put('/progress', authenticateToken, authController.syncProgress);

// POST /api/auth/change-password - Đổi mật khẩu tài khoản nội bộ (yêu cầu đăng nhập)
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;
