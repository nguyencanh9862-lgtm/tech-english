const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');
const Vocabulary = require('../models/Vocabulary');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

describe('API Routes Unit & Integration Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/health', () => {
    test('trả về trạng thái online và thông tin hệ thống', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('online');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /admin', () => {
    test('chuyển hướng tới trang quản trị khi truy cập /admin', async () => {
      const res = await request(app).get('/admin');
      expect([301, 302]).toContain(res.status);
      expect(res.headers.location).toMatch(/admin/);
    });
  });

  describe('Auth Routes (/api/auth)', () => {
    test('GET /api/auth/config trả về googleClientId', async () => {
      const res = await request(app).get('/api/auth/config');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('googleClientId');
    });

    describe('POST /api/auth/register', () => {
      test('báo lỗi 400 nếu thiếu thông tin bắt buộc', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ name: 'Test' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Vui lòng điền đủ họ tên, email và mật khẩu');
      });

      test('báo lỗi 400 nếu email đã được đăng ký trước đó', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'exist@example.com' });

        const res = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Nguyen Van A',
            email: 'exist@example.com',
            password: 'password123'
          });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email đã được sử dụng');
      });

      test('đăng ký thành công và trả về mã token cùng dữ liệu người dùng (201)', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);
        jest.spyOn(User.prototype, 'save').mockImplementation(function () {
          this._id = 'mocked_user_id';
          return Promise.resolve(this);
        });

        const res = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Nguyen Van New',
            email: 'newuser@example.com',
            password: 'password123'
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe('newuser@example.com');
      });
    });

    describe('POST /api/auth/login', () => {
      test('báo lỗi 400 nếu không gửi email hoặc mật khẩu', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      });

      test('đăng nhập thành công với tài khoản quản trị mặc định (admin / admin123)', async () => {
        const mockAdmin = {
          _id: 'admin_id_1',
          name: 'Quản trị viên',
          email: 'admin@englishmaster.vn',
          avatar: '',
          role: 'admin'
        };
        jest.spyOn(User, 'findOne').mockResolvedValue(mockAdmin);

        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin',
            password: 'admin123'
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.role).toBe('admin');
        expect(res.body).toHaveProperty('token');
      });

      test('báo lỗi 400 khi mật khẩu không khớp', async () => {
        const mockUser = {
          _id: 'user_1',
          email: 'user@example.com',
          password: 'hashed_password'
        };
        jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'user@example.com',
            password: 'wrong_password'
          });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Tài khoản hoặc mật khẩu không đúng');
      });
    });
  });

  describe('Vocabulary Routes (/api/vocab)', () => {
    test('GET /api/vocab trả về danh sách từ vựng', async () => {
      const mockList = [
        { id: 1, word: 'Algorithm', meaning: 'Thuật toán' },
        { id: 2, word: 'Function', meaning: 'Hàm' }
      ];

      jest.spyOn(Vocabulary, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockList)
      });

      const res = await request(app).get('/api/vocab');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].word).toBe('Algorithm');
    });

    test('POST /api/vocab báo lỗi 400 nếu thiếu từ hoặc nghĩa', async () => {
      const res = await request(app)
        .post('/api/vocab')
        .send({ word: 'Test' }); // thiếu meaning

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Từ vựng và nghĩa là bắt buộc');
    });

    test('GET /api/vocab/:id báo lỗi 404 khi không tìm thấy từ', async () => {
      jest.spyOn(Vocabulary, 'findOne').mockResolvedValue(null);

      const res = await request(app).get('/api/vocab/9999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Quiz Routes (/api/quiz)', () => {
    test('GET /api/quiz trả về danh sách câu hỏi phân nhóm theo danh mục', async () => {
      const mockQuizzes = [
        { _id: '1', category: 'vocabulary', q: 'Q1', options: ['A', 'B'], answer: 0 },
        { _id: '2', category: 'grammar', q: 'Q2', options: ['A', 'B'], answer: 1 }
      ];
      jest.spyOn(Quiz, 'find').mockResolvedValue(mockQuizzes);

      const res = await request(app).get('/api/quiz');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vocabulary.length).toBe(1);
      expect(res.body.data.grammar.length).toBe(1);
    });

    test('POST /api/quiz báo lỗi 400 nếu thiếu nội dung câu hỏi', async () => {
      const res = await request(app)
        .post('/api/quiz')
        .send({ category: 'vocabulary' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Course Routes (/api/courses)', () => {
    test('POST /api/courses báo lỗi 400 nếu thiếu title hoặc description', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({ title: 'Course Name' }); // thiếu description

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Google Sheets Routes (/api/sheets)', () => {
    test('GET /api/sheets/sample/:type trả về dữ liệu mẫu có sẵn', async () => {
      const resVocab = await request(app).get('/api/sheets/sample/vocab');
      expect(resVocab.status).toBe(200);
      expect(resVocab.body.success).toBe(true);
      expect(Array.isArray(resVocab.body.data)).toBe(true);
      expect(resVocab.body.data.length).toBeGreaterThan(0);

      const resCourse = await request(app).get('/api/sheets/sample/course');
      expect(resCourse.status).toBe(200);
      expect(resCourse.body.success).toBe(true);

      const resQuiz = await request(app).get('/api/sheets/sample/quiz');
      expect(resQuiz.status).toBe(200);
      expect(resQuiz.body.success).toBe(true);
    });

    test('POST /api/sheets/parse báo lỗi 400 khi thiếu link Google Sheet', async () => {
      const res = await request(app)
        .post('/api/sheets/parse')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Vui lòng cung cấp link Google Sheet');
    });

    test('POST /api/sheets/parse báo lỗi 400 khi link Google Sheet không đúng định dạng', async () => {
      const res = await request(app)
        .post('/api/sheets/parse')
        .send({ url: 'https://invalid-sheet-url.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Link Google Sheet không hợp lệ');
    });
  });
});
