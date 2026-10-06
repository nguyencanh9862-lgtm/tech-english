const User = require('../models/User');
const Vocabulary = require('../models/Vocabulary');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Grammar = require('../models/Grammar');
const News = require('../models/News');
const ITCourse = require('../models/ITCourse');
const Media = require('../models/Media');

describe('Mongoose Models Schema Validation Unit Tests', () => {
  describe('User Model', () => {
    test('hợp lệ khi truyền đầy đủ thông tin bắt buộc', async () => {
      const user = new User({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'hashed_password_123'
      });

      await expect(user.validate()).resolves.toBeUndefined();
      expect(user.xp).toBe(0);
      expect(user.streak).toBe(0);
      expect(user.role).toBe('user');
      expect(user.authProvider).toBe('local');
      expect(user.learnedWords).toEqual([]);
      expect(user.earnedBadges).toEqual([]);
    });

    test('báo lỗi validation nếu thiếu name hoặc email', async () => {
      const user = new User({});
      let err;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    test('báo lỗi validation nếu role không thuộc enum hợp lệ', async () => {
      const user = new User({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        role: 'superadmin' // không hợp lệ, chỉ 'user' hoặc 'admin'
      });

      let err;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.role).toBeDefined();
    });

    test('báo lỗi validation nếu authProvider không thuộc enum hợp lệ', async () => {
      const user = new User({
        name: 'Nguyen Van A',
        email: 'test@example.com',
        authProvider: 'facebook' // không hợp lệ, chỉ 'google' hoặc 'local'
      });

      let err;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.authProvider).toBeDefined();
    });
  });

  describe('Vocabulary Model', () => {
    test('hợp lệ khi truyền đủ id, word, meaning', async () => {
      const vocab = new Vocabulary({
        id: 1,
        word: 'Variable',
        meaning: 'Biến trong lập trình'
      });

      await expect(vocab.validate()).resolves.toBeUndefined();
      expect(vocab.pos).toBe('n');
      expect(vocab.category).toBe('daily');
      expect(vocab.level).toBe('A1');
    });

    test('báo lỗi nếu thiếu id, word hoặc meaning', async () => {
      const vocab = new Vocabulary({});
      let err;
      try {
        await vocab.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.id).toBeDefined();
      expect(err.errors.word).toBeDefined();
      expect(err.errors.meaning).toBeDefined();
    });
  });

  describe('Quiz Model', () => {
    test('hợp lệ khi có category, q, options, answer', async () => {
      const quiz = new Quiz({
        category: 'vocabulary',
        q: 'What is an algorithm?',
        options: ['A step-by-step procedure', 'A database', 'A compiler', 'A server'],
        answer: 0
      });

      await expect(quiz.validate()).resolves.toBeUndefined();
    });

    test('báo lỗi nếu category không nằm trong enum', async () => {
      const quiz = new Quiz({
        category: 'invalid_category',
        q: 'Test question',
        options: ['A', 'B'],
        answer: 0
      });

      let err;
      try {
        await quiz.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.category).toBeDefined();
    });

    test('báo lỗi nếu thiếu các trường bắt buộc', async () => {
      const quiz = new Quiz({});
      let err;
      try {
        await quiz.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.category).toBeDefined();
      expect(err.errors.q).toBeDefined();
      expect(err.errors.answer).toBeDefined();
    });
  });

  describe('Course Model', () => {
    test('hợp lệ và thiết lập các giá trị mặc định chính xác', async () => {
      const course = new Course({
        id: 1,
        title: 'Khóa học tiếng Anh IT',
        description: 'Mô tả khóa học'
      });

      await expect(course.validate()).resolves.toBeUndefined();
      expect(course.category).toBe('communication');
      expect(course.level).toBe('Cơ bản (A1-A2)');
      expect(course.instructor).toBe('EnglishMaster Team');
      expect(course.views).toBe(0);
      expect(course.rating).toBe(5.0);
      expect(course.lessons).toEqual([]);
    });

    test('báo lỗi nếu thiếu title hoặc description', async () => {
      const course = new Course({ id: 1 });
      let err;
      try {
        await course.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.description).toBeDefined();
    });

    test('hợp lệ khi nhúng mảng lessons', async () => {
      const course = new Course({
        id: 1,
        title: 'Python for Beginners',
        description: 'Lập trình cơ bản',
        lessons: [{
          id: 1,
          title: 'Bài 1: Cài đặt môi trường',
          youtubeUrl: 'https://youtube.com/watch?v=12345678901'
        }]
      });

      await expect(course.validate()).resolves.toBeUndefined();
      expect(course.lessons.length).toBe(1);
      expect(course.lessons[0].title).toBe('Bài 1: Cài đặt môi trường');
    });
  });

  describe('News Model', () => {
    test('báo lỗi nếu thiếu title, summary hoặc content', async () => {
      const news = new News({});
      let err;
      try {
        await news.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.summary).toBeDefined();
      expect(err.errors.content).toBeDefined();
    });

    test('hợp lệ khi có đủ thông tin bài viết', async () => {
      const news = new News({
        id: 1,
        title: 'Xu hướng AI 2026',
        summary: 'Tóm tắt bài viết',
        content: 'Nội dung chi tiết bài viết'
      });

      await expect(news.validate()).resolves.toBeUndefined();
      expect(news.category).toBe('ai');
      expect(news.views).toBe(120);
    });
  });

  describe('Media Model', () => {
    test('báo lỗi nếu thiếu filename, originalname, url, mimetype, size', async () => {
      const media = new Media({});
      let err;
      try {
        await media.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors.filename).toBeDefined();
      expect(err.errors.url).toBeDefined();
      expect(err.errors.mimetype).toBeDefined();
      expect(err.errors.size).toBeDefined();
    });

    test('hợp lệ khi có đủ thông tin file upload', async () => {
      const media = new Media({
        filename: 'avatar-123.png',
        originalname: 'my-avatar.png',
        mimetype: 'image/png',
        size: 10240,
        url: '/uploads/avatar-123.png'
      });

      await expect(media.validate()).resolves.toBeUndefined();
    });
  });
});
