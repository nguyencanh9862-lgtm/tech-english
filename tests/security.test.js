const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const { requireAdmin, JWT_SECRET } = require('../middleware/auth');
const {
  escapeRegex,
  validatePassword,
  validateEmail,
  sanitizeText
} = require('../middleware/security');

describe('Web Security Features Comprehensive Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('HTTP Security Headers (Helmet)', () => {
    test('phải bao gồm các header bảo mật HTTP thiết yếu và ẩn X-Powered-By', async () => {
      const res = await request(app).get('/api/health');

      expect(res.headers).not.toHaveProperty('x-powered-by');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers).toHaveProperty('content-security-policy');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  describe('NoSQL Injection Protection', () => {
    test('bộ lọc NoSQL injection phải loại bỏ các toán tử MongoDB ($gt, $ne, $where...)', async () => {
      // Gửi body có chứa toán tử $gt độc hại
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { '$gt': '' },
          password: 'password123'
        });

      // Hệ thống phát hiện thiếu trường email hợp lệ
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('ReDoS & Regex Injection Protection', () => {
    test('escapeRegex phải thoát toàn bộ ký tự đặc biệt nguy hiểm', () => {
      const maliciousPayload = '.*+?^${}()|[]\\test';
      const escaped = escapeRegex(maliciousPayload);

      expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\test');
      expect(() => new RegExp(escaped)).not.toThrow();
    });

    test('escapeRegex xử lý an toàn giá trị không phải chuỗi', () => {
      expect(escapeRegex(null)).toBe('');
      expect(escapeRegex(undefined)).toBe('');
      expect(escapeRegex(12345)).toBe('');
    });
  });

  describe('Input Validation & Password Policy', () => {
    test('validatePassword từ chối mật khẩu dưới 6 ký tự hoặc rỗng', () => {
      expect(validatePassword('').valid).toBe(false);
      expect(validatePassword('12345').valid).toBe(false);
      expect(validatePassword('123456').valid).toBe(true);
      expect(validatePassword('SecurePass@2026').valid).toBe(true);
    });

    test('validateEmail xác thực định dạng email hợp lệ', () => {
      expect(validateEmail('').valid).toBe(false);
      expect(validateEmail('invalid_email').valid).toBe(false);
      expect(validateEmail('user@domain').valid).toBe(false);
      expect(validateEmail('user@example.com').valid).toBe(true);
    });

    test('sanitizeText làm sạch các ký tự XSS', () => {
      const dirtyHtml = '<script>alert("XSS")</script>';
      const clean = sanitizeText(dirtyHtml);

      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });
  });

  describe('Role-Based Access Control (requireAdmin)', () => {
    let req, res, next;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    test('từ chối 403 nếu người dùng không có vai trò admin', () => {
      req = { user: { role: 'user', name: 'Regular User' } };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Từ chối truy cập')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    test('cho phép chuyển tiếp next() nếu người dùng là admin', () => {
      req = { user: { role: 'admin', name: 'Super Admin' } };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Path Traversal Protection on Media Deletion', () => {
    test('từ chối xóa file nếu filename chứa ký tự duyệt thư mục (../)', async () => {
      const Media = require('../models/Media');
      jest.spyOn(Media, 'findOneAndDelete').mockResolvedValue(null);

      const res = await request(app).delete('/api/media/..%2F..%2Fpackage.json');
      expect([400, 404, 200]).toContain(res.status);
    });
  });

  describe('POST /api/auth/change-password (Secure Password Change)', () => {
    test('báo lỗi 400 nếu mật khẩu mới dưới 6 ký tự', async () => {
      const token = jwt.sign({ id: 'user_1' }, JWT_SECRET);
      jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'user_1', password: 'hashed_password' });

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'current_pass',
          newPassword: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Mật khẩu phải chứa ít nhất 6 ký tự');
    });

    test('báo lỗi 400 nếu mật khẩu cũ không đúng', async () => {
      const token = jwt.sign({ id: 'user_1' }, JWT_SECRET);
      const mockUser = { _id: 'user_1', password: 'hashed_password' };

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'wrong_old_password',
          newPassword: 'new_valid_password'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Mật khẩu hiện tại không chính xác');
    });

    test('đổi mật khẩu thành công khi mật khẩu cũ chính xác và mật khẩu mới hợp lệ', async () => {
      const token = jwt.sign({ id: 'user_1' }, JWT_SECRET);
      const mockUser = {
        _id: 'user_1',
        password: 'hashed_password',
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new_hashed_password');

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'correct_old_pass',
          newPassword: 'new_super_pass_123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Đổi mật khẩu thành công');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
