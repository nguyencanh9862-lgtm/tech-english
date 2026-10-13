const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Lấy danh sách tất cả người dùng
router.get('/', userController.getAllUsers);

// DELETE /api/users/:id - Xóa người dùng theo ID
router.delete('/:id', userController.deleteUser);

// PATCH /api/users/:id/role - Thay đổi quyền hạn người dùng
router.patch('/:id/role', userController.updateUserRole);

module.exports = router;
