const { getDbState } = require('../config/db');

/**
 * Controller xử lý trạng thái hệ thống và điều hướng (Next.js + Express + MySQL)
 */

// GET /api/health - Kiểm tra tình trạng sức khỏe của server và cơ sở dữ liệu MySQL
function getHealth(req, res) {
  const db = getDbState();
  res.json({
    status: 'online',
    database: db.connected ? 'connected' : 'disconnected',
    dbType: 'MySQL',
    engine: db.engine,
    framework: 'Next.js + Express',
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
