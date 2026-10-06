const request = require('supertest');
const app = require('../server');
const Course = require('../models/Course');
const Grammar = require('../models/Grammar');
const News = require('../models/News');
const ITCourse = require('../models/ITCourse');

describe('Courses, Grammar, News, and IT Routes Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Course Routes (/api/courses)', () => {
    test('GET /api/courses trả về danh sách khóa học với bộ lọc', async () => {
      const mockCourses = [
        { id: 1, title: 'English for IT', category: 'it', level: 'B1' }
      ];
      jest.spyOn(Course, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCourses)
      });

      const res = await request(app).get('/api/courses?category=it&search=English');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    test('GET /api/courses/:id trả về chi tiết khóa học', async () => {
      const mockCourse = { id: 1, title: 'English for IT', views: 5 };
      jest.spyOn(Course, 'findOneAndUpdate').mockResolvedValue(mockCourse);

      const res = await request(app).get('/api/courses/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('English for IT');
    });

    test('GET /api/courses/:id báo lỗi 404 khi không tìm thấy khóa học', async () => {
      jest.spyOn(Course, 'findOneAndUpdate').mockResolvedValue(null);

      const res = await request(app).get('/api/courses/999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/courses tạo mới khóa học thành công', async () => {
      jest.spyOn(Course, 'findOne').mockReturnValue({
        sort: jest.fn().mockResolvedValue({ id: 5 })
      });
      jest.spyOn(Course.prototype, 'save').mockResolvedValue(this);

      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'New Course',
          description: 'Description of course',
          youtubeUrl: 'https://www.youtube.com/watch?v=kJEsTjH5mVg'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Course');
      expect(res.body.data.youtubeId).toBe('kJEsTjH5mVg');
    });

    test('DELETE /api/courses/:id xóa khóa học thành công', async () => {
      jest.spyOn(Course, 'findOneAndDelete').mockResolvedValue({ id: 1 });

      const res = await request(app).delete('/api/courses/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Đã xóa khóa học thành công');
    });

    test('POST /api/courses/:id/lessons thêm bài học video vào khóa học', async () => {
      const mockCourse = {
        id: 1,
        lessons: [],
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(Course, 'findOne').mockResolvedValue(mockCourse);

      const res = await request(app)
        .post('/api/courses/1/lessons')
        .send({
          title: 'Bài 1: Git basics',
          youtubeUrl: 'https://www.youtube.com/watch?v=kJEsTjH5mVg'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockCourse.lessons.length).toBe(1);
      expect(mockCourse.save).toHaveBeenCalled();
    });
  });

  describe('Grammar Routes (/api/grammar)', () => {
    test('GET /api/grammar trả về danh sách bài học ngữ pháp', async () => {
      const mockGrammar = [
        { _id: 'g1', title: 'Hiện tại đơn', rules: [] }
      ];
      jest.spyOn(Grammar, 'find').mockResolvedValue(mockGrammar);

      const res = await request(app).get('/api/grammar');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    test('POST /api/grammar tạo mới bài học ngữ pháp', async () => {
      jest.spyOn(Grammar.prototype, 'save').mockResolvedValue(this);

      const res = await request(app)
        .post('/api/grammar')
        .send({ title: 'Hiện tại hoàn thành', content: 'Cấu trúc S + have/has + V3' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Thêm bài ngữ pháp thành công');
    });

    test('DELETE /api/grammar/:id xóa bài học ngữ pháp', async () => {
      jest.spyOn(Grammar, 'findByIdAndDelete').mockResolvedValue({ _id: 'g1' });

      const res = await request(app).delete('/api/grammar/g1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('News Routes (/api/news)', () => {
    test('GET /api/news trả về danh sách tin tức', async () => {
      const mockNews = [
        { id: 1, title: 'AI news', summary: 'Summary', content: 'Content' }
      ];
      jest.spyOn(News, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNews)
        })
      });

      const res = await request(app).get('/api/news');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toBe('AI news');
    });

    test('POST /api/news báo lỗi 400 nếu thiếu tiêu đề, tóm tắt hoặc nội dung', async () => {
      const res = await request(app)
        .post('/api/news')
        .send({ title: 'Only title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Tiêu đề, tóm tắt và nội dung là bắt buộc');
    });

    test('POST /api/news tạo bài viết thành công khi đủ dữ liệu', async () => {
      jest.spyOn(News, 'findOne').mockReturnValue({
        sort: jest.fn().mockResolvedValue({ id: 1 })
      });
      jest.spyOn(News.prototype, 'save').mockResolvedValue(this);

      const res = await request(app)
        .post('/api/news')
        .send({
          title: 'Công nghệ mới',
          summary: 'Tóm tắt bài viết',
          content: 'Nội dung chi tiết'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Công nghệ mới');
    });
  });

  describe('IT Courses Routes (/api/it)', () => {
    test('GET /api/it/courses trả về danh sách các khóa học CNTT', async () => {
      const mockIT = [
        { id: 1, title: 'Frontend Developer English' }
      ];
      jest.spyOn(ITCourse, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockIT)
      });

      const res = await request(app).get('/api/it/courses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    test('GET /api/it/terms trả về danh sách thuật ngữ tổng hợp', async () => {
      const mockCourses = [
        {
          title: 'Git Course',
          category: 'git',
          keyVocab: [
            { toObject: () => ({ word: 'Commit', meaning: 'Lưu thay đổi' }) }
          ]
        }
      ];
      jest.spyOn(ITCourse, 'find').mockResolvedValue(mockCourses);

      const res = await request(app).get('/api/it/terms');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].word).toBe('Commit');
      expect(res.body.data[0].courseTitle).toBe('Git Course');
    });
  });
});
