const mongoose = require('mongoose');

/**
 * Controller xử lý trạng thái hệ thống và điều hướng
 */

// GET /api/health - Kiểm tra tình trạng sức khỏe của server và cơ sở dữ liệu
function getHealth(req, res) {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
}

// GET /admin - Điều hướng thân thiện tới trang admin panel
function redirectToAdmin(req, res) {
  res.redirect('/admin/index.html');
}

module.exports = {
  getHealth,
  redirectToAdmin
};
