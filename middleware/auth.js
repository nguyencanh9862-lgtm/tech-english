const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cd_english_secret_key_2026';

// Warn if using default secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'cd_english_secret_key_2026') {
  console.warn('⚠️ CẢNH BÁO BẢO MẬT: Đang sử dụng JWT_SECRET mặc định trong môi trường production! Vui lòng đặt JWT_SECRET trong .env.');
}

/**
 * Middleware xác thực token JWT
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
  }
};

/**
 * Middleware phân quyền chỉ dành cho Quản trị viên (Admin RBAC)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Từ chối truy cập: Bạn không có quyền quản trị viên'
    });
  }
  next();
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAdmin
};
