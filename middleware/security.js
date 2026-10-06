const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Helmet Security Headers
 * Thiết lập các tiêu chuẩn an toàn HTTP: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://accounts.google.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://images.unsplash.com",
        "https://img.youtube.com",
        "https://i.ytimg.com",
        "https://ui-avatars.com",
        "https://lh3.googleusercontent.com",
        "https://*.googleusercontent.com"
      ],
      frameSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "https://accounts.google.com"
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://docs.google.com",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Cho phép hiển thị ảnh upload tĩnh
  crossOriginEmbedderPolicy: false // Cho phép nhúng video YouTube
});

/**
 * Ngăn chặn NoSQL Injection bằng cách lọc các ký tự bắt đầu bằng `$` hoặc `.` trong query/body (Hỗ trợ Express 5)
 */
function mongoSanitizeMiddleware(req, res, next) {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (/^\$/.test(key) || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) sanitize(req.query);

  next();
}

/**
 * Thoát các ký tự đặc biệt trong biểu thức chính quy (Tránh ReDoS / Regex Injection)
 */
function escapeRegex(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Kiểm tra tính an toàn của mật khẩu
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Mật khẩu không được để trống' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Mật khẩu phải chứa ít nhất 6 ký tự' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Mật khẩu không được vượt quá 128 ký tự' };
  }
  return { valid: true };
}

/**
 * Kiểm tra định dạng email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email không được để trống' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Định dạng email không hợp lệ' };
  }
  return { valid: true };
}

/**
 * Khử mã độc XSS trong chuỗi văn bản
 */
function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

module.exports = {
  helmetMiddleware,
  mongoSanitizeMiddleware,
  escapeRegex,
  validatePassword,
  validateEmail,
  sanitizeText
};
