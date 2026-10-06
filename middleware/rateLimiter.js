const rateLimit = require('express-rate-limit');

// Rate limiter chung cho toàn bộ API (chống DDoS / spam request)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: process.env.NODE_ENV === 'test' ? 10000 : 500, // 500 requests / 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Hệ thống phát hiện quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.'
  }
});

// Rate limiter nghiêm ngặt cho Authentication (chống Brute-Force mật khẩu)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: process.env.NODE_ENV === 'test' ? 10000 : 30, // 30 lần thử / 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã thử đăng nhập/đăng ký quá nhiều lần. Vui lòng đợi 15 phút để bảo vệ tài khoản.'
  }
});

// Rate limiter cho File Upload (chống cạn kiệt dung lượng đĩa)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã tải lên quá nhiều file. Vui lòng thử lại sau 15 phút.'
  }
});

// Rate limiter cho Import Google Sheet
const sheetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã thực hiện thao tác đồng bộ quá nhiều lần. Vui lòng thử lại sau.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  sheetLimiter
};
