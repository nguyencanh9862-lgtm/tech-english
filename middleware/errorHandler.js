/**
 * Centralized Error Handling Middleware
 * Ngăn chặn rò rỉ stack trace và chi tiết cơ sở dữ liệu nội bộ ra phía client
 */
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log chi tiết lỗi trên server console
  if (process.env.NODE_ENV !== 'test') {
    console.error('❌ Server Error:', {
      message: err.message,
      stack: isDev ? err.stack : undefined,
      path: req.path,
      method: req.method
    });
  }

  // Xử lý lỗi CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Từ chối truy cập do chính sách bảo mật CORS'
    });
  }

  // Xử lý lỗi Multer (kích thước file quá lớn hoặc loại file không hợp lệ)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Kích thước file vượt quá giới hạn tối đa (10MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Lỗi tải file: ' + err.message
    });
  }

  const statusCode = err.status || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: isDev ? err.message : 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau',
    ...(isDev && { error: err.message })
  });
}

module.exports = errorHandler;
