const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Vocabulary = require('../models/Vocabulary');
const Grammar = require('../models/Grammar');
const Quiz = require('../models/Quiz');
const Media = require('../models/Media');
const Course = require('../models/Course');

describe('User and Stats Routes Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('User Routes (/api/users)', () => {
    test('GET /api/users trả về danh sách tất cả người dùng', async () => {
      const mockUsers = [
        { _id: 'u1', name: 'User 1', email: 'u1@example.com' },
        { _id: 'u2', name: 'User 2', email: 'u2@example.com' }
      ];

      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers)
        })
      });

      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].name).toBe('User 1');
    });

    test('DELETE /api/users/:id xóa người dùng thành công', async () => {
      jest.spyOn(User, 'findByIdAndDelete').mockResolvedValue({ _id: 'u1', name: 'User 1' });

      const res = await request(app).delete('/api/users/u1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Đã xóa người dùng thành công');
    });

    test('DELETE /api/users/:id báo lỗi 404 khi không tìm thấy người dùng', async () => {
      jest.spyOn(User, 'findByIdAndDelete').mockResolvedValue(null);

      const res = await request(app).delete('/api/users/u999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('PATCH /api/users/:id/role cập nhật vai trò người dùng thành công', async () => {
      jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'u1', role: 'admin' })
      });

      const res = await request(app)
        .patch('/api/users/u1/role')
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });
  });

  describe('Stats Routes (/api/stats)', () => {
    test('GET /api/stats trả về tổng số lượng và thống kê phân loại', async () => {
      jest.spyOn(Vocabulary, 'countDocuments').mockResolvedValue(100);
      jest.spyOn(Grammar, 'countDocuments').mockResolvedValue(20);
      jest.spyOn(Quiz, 'countDocuments').mockResolvedValue(50);
      jest.spyOn(Media, 'countDocuments').mockResolvedValue(10);
      jest.spyOn(User, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Course, 'countDocuments').mockResolvedValue(8);

      jest.spyOn(Vocabulary, 'aggregate')
        .mockResolvedValueOnce([{ _id: 'daily', count: 60 }])
        .mockResolvedValueOnce([{ _id: 'A1', count: 40 }]);

      const res = await request(app).get('/api/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vocabCount).toBe(100);
      expect(res.body.data.grammarCount).toBe(20);
      expect(res.body.data.quizCount).toBe(50);
      expect(res.body.data.courseCount).toBe(8);
      expect(res.body.data.categories).toHaveLength(1);
    });
  });

  describe('Auth Protected Routes (/api/auth/me & /api/auth/progress)', () => {
    const validToken = jwt.sign({ id: 'user_123' }, 'cd_english_secret_key_2026');

    test('GET /api/auth/me trả về thông tin profile người dùng đã đăng nhập', async () => {
      const mockUser = {
        _id: 'user_123',
        name: 'Nguyen Van A',
        email: 'a@example.com',
        avatar: '',
        authProvider: 'local',
        role: 'user',
        xp: 150,
        streak: 3,
        learnedWords: [1, 2],
        earnedBadges: ['badge_first_lesson'],
        createdAt: new Date().toISOString()
      };

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Nguyen Van A');
      expect(res.body.user.xp).toBe(150);
    });

    test('PUT /api/auth/progress cập nhật tiến độ học tập của người dùng', async () => {
      const mockUser = {
        _id: 'user_123',
        xp: 100,
        streak: 2,
        learnedWords: [],
        earnedBadges: [],
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const res = await request(app)
        .put('/api/auth/progress')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          xp: 200,
          streak: 4,
          learnedWords: [1, 2, 3],
          earnedBadges: ['streak_master']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.xp).toBe(200);
      expect(res.body.user.streak).toBe(4);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
