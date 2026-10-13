const {
  authController,
  courseController,
  grammarController,
  itController,
  newsController,
  quizController,
  sheetController,
  statsController,
  uploadController,
  userController,
  vocabController,
  systemController
} = require('../controllers');
const viewController = require('../controllers/viewController');

const Vocabulary = require('../models/Vocabulary');
const Course = require('../models/Course');
const Grammar = require('../models/Grammar');
const Quiz = require('../models/Quiz');
const News = require('../models/News');
const ITCourse = require('../models/ITCourse');
const User = require('../models/User');

// Helper to create mock response object
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.sendFile = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
}

describe('MVC Controllers Unit Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('systemController & viewController (Triangular MVC Flow)', () => {
    test('systemController.getHealth trả về trạng thái online', () => {
      const req = {};
      const res = mockResponse();
      systemController.getHealth(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'online',
          timestamp: expect.any(String)
        })
      );
    });

    test('viewController.getAdminView chuyển hướng tới /admin/index.html', () => {
      const req = {};
      const res = mockResponse();
      viewController.getAdminView(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/admin/index.html');
    });

    test('viewController.getHomeView trả về file index.html', () => {
      const req = {};
      const res = mockResponse();
      viewController.getHomeView(req, res);

      expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('index.html'));
    });

    test('viewController.renderHome: Controller điều phối Model và đổ dữ liệu vào View (home.ejs)', async () => {
      jest.spyOn(Vocabulary, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ word: 'Deploy' }])
        })
      });
      jest.spyOn(Course, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ title: 'Web Course' }])
        })
      });
      jest.spyOn(News, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ title: 'AI News' }])
        })
      });
      jest.spyOn(Vocabulary, 'countDocuments').mockResolvedValue(10);
      jest.spyOn(Course, 'countDocuments').mockResolvedValue(5);

      const req = {};
      const res = mockResponse();

      await viewController.renderHome(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'home',
        expect.objectContaining({
          vocabList: expect.any(Array),
          courses: expect.any(Array),
          newsList: expect.any(Array),
          stats: expect.objectContaining({ vocabCount: 10, courseCount: 5 })
        })
      );
    });

    test('viewController.renderVocab: Controller truy vấn Model và render view vocab.ejs', async () => {
      jest.spyOn(Vocabulary, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ word: 'Framework' }])
      });

      const req = {};
      const res = mockResponse();

      await viewController.renderVocab(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'vocab',
        expect.objectContaining({
          vocabList: expect.any(Array)
        })
      );
    });

    test('viewController.renderCourses: Controller truy vấn Model và render view courses.ejs', async () => {
      jest.spyOn(Course, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ title: 'Dev Course' }])
      });

      const req = {};
      const res = mockResponse();

      await viewController.renderCourses(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'courses',
        expect.objectContaining({
          courses: expect.any(Array)
        })
      );
    });

    test('viewController.renderGrammar: Controller truy vấn Grammar Model và render view grammar.ejs', async () => {
      jest.spyOn(Grammar, 'find').mockResolvedValue([{ title: 'Present Simple' }]);

      const req = {};
      const res = mockResponse();

      await viewController.renderGrammar(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'grammar',
        expect.objectContaining({
          grammarList: expect.any(Array)
        })
      );
    });

    test('viewController.renderQuiz: Controller truy vấn Quiz Model và render view quiz.ejs', async () => {
      jest.spyOn(Quiz, 'find').mockResolvedValue([{ category: 'vocabulary', q: 'Q1' }]);

      const req = {};
      const res = mockResponse();

      await viewController.renderQuiz(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'quiz',
        expect.objectContaining({
          groupedQuizzes: expect.any(Object)
        })
      );
    });

    test('viewController.renderNews: Controller truy vấn News Model và render view news.ejs', async () => {
      jest.spyOn(News, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ title: 'Tech Trends' }])
      });

      const req = {};
      const res = mockResponse();

      await viewController.renderNews(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'news',
        expect.objectContaining({
          newsList: expect.any(Array)
        })
      );
    });

    test('viewController.renderIT: Controller truy vấn ITCourse Model và render view it.ejs', async () => {
      jest.spyOn(ITCourse, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ title: 'Git Mastery', keyVocab: [] }])
      });

      const req = {};
      const res = mockResponse();

      await viewController.renderIT(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'it',
        expect.objectContaining({
          itCourses: expect.any(Array),
          itTerms: expect.any(Array)
        })
      );
    });

    test('viewController.renderAdmin: Controller truy vấn User & Stats và render view admin.ejs', async () => {
      jest.spyOn(Vocabulary, 'countDocuments').mockResolvedValue(10);
      jest.spyOn(Course, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Grammar, 'countDocuments').mockResolvedValue(4);
      jest.spyOn(Quiz, 'countDocuments').mockResolvedValue(20);
      jest.spyOn(User, 'countDocuments').mockResolvedValue(3);
      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ name: 'Admin', role: 'admin' }])
        })
      });

      const req = {};
      const res = mockResponse();

      await viewController.renderAdmin(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'admin',
        expect.objectContaining({
          stats: expect.any(Object),
          users: expect.any(Array)
        })
      );
    });

    test('viewController.renderLogin: Controller render view login.ejs', () => {
      const req = {};
      const res = mockResponse();

      viewController.renderLogin(req, res);

      expect(res.render).toHaveBeenCalledWith('login', expect.any(Object));
    });
  });

  describe('vocabController', () => {
    test('getAllVocab trả về danh sách từ vựng thành công', async () => {
      const mockList = [{ id: 1, word: 'Async', meaning: 'Bất đồng bộ' }];
      jest.spyOn(Vocabulary, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockList)
      });

      const req = { query: { category: 'it', level: 'B2', search: 'Async' } };
      const res = mockResponse();

      await vocabController.getAllVocab(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockList
      });
    });

    test('getVocabById trả về 404 nếu không tìm thấy từ', async () => {
      jest.spyOn(Vocabulary, 'findOne').mockResolvedValue(null);

      const req = { params: { id: '999' } };
      const res = mockResponse();

      await vocabController.getVocabById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Không tìm thấy từ vựng' })
      );
    });
  });

  describe('courseController', () => {
    test('getAllCourses trả về danh sách các khóa học', async () => {
      const mockCourses = [{ id: 1, title: 'English for Devs' }];
      jest.spyOn(Course, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCourses)
      });

      const req = { query: {} };
      const res = mockResponse();

      await courseController.getAllCourses(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockCourses
      });
    });

    test('createCourse báo lỗi 400 nếu thiếu title hoặc description', async () => {
      const req = { body: { title: '' } };
      const res = mockResponse();

      await courseController.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe('grammarController', () => {
    test('getAllGrammar trả về danh sách bài học', async () => {
      const mockGrammar = [{ _id: '1', title: 'Past Simple' }];
      jest.spyOn(Grammar, 'find').mockResolvedValue(mockGrammar);

      const req = {};
      const res = mockResponse();

      await grammarController.getAllGrammar(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockGrammar
      });
    });
  });

  describe('quizController', () => {
    test('getAllQuizzes phân nhóm câu hỏi theo 4 danh mục', async () => {
      const mockList = [
        { _id: '1', category: 'vocabulary', q: 'Q1', options: ['A', 'B'], answer: 0 }
      ];
      jest.spyOn(Quiz, 'find').mockResolvedValue(mockList);

      const req = {};
      const res = mockResponse();

      await quizController.getAllQuizzes(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            vocabulary: expect.any(Array),
            grammar: expect.any(Array),
            listening: expect.any(Array),
            mixed: expect.any(Array)
          })
        })
      );
    });
  });

  describe('newsController', () => {
    test('getAllNews trả về danh sách bài viết', async () => {
      const mockNews = [{ id: 1, title: 'AI in 2026' }];
      jest.spyOn(News, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNews)
        })
      });

      const req = { query: {} };
      const res = mockResponse();

      await newsController.getAllNews(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockNews
      });
    });
  });

  describe('itController', () => {
    test('getITCourses trả về danh sách khóa học CNTT', async () => {
      const mockCourses = [{ id: 1, title: 'Backend Mastery' }];
      jest.spyOn(ITCourse, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCourses)
      });

      const req = { query: {} };
      const res = mockResponse();

      await itController.getITCourses(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockCourses
      });
    });
  });

  describe('userController', () => {
    test('getAllUsers trả về danh sách người dùng ẩn mật khẩu', async () => {
      const mockUsers = [{ _id: 'u1', name: 'Canh Nguyen' }];
      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers)
        })
      });

      const req = {};
      const res = mockResponse();

      await userController.getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockUsers
      });
    });
  });

  describe('sheetController', () => {
    test('getSampleData trả về dữ liệu mẫu chính xác cho từng loại', () => {
      const reqVocab = { params: { type: 'vocab' } };
      const resVocab = mockResponse();
      sheetController.getSampleData(reqVocab, resVocab);
      expect(resVocab.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

      const reqCourse = { params: { type: 'course' } };
      const resCourse = mockResponse();
      sheetController.getSampleData(reqCourse, resCourse);
      expect(resCourse.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

      const reqQuiz = { params: { type: 'quiz' } };
      const resQuiz = mockResponse();
      sheetController.getSampleData(reqQuiz, resQuiz);
      expect(resQuiz.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('authController', () => {
    test('getConfig trả về googleClientId', () => {
      const req = {};
      const res = mockResponse();
      authController.getConfig(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          googleClientId: expect.any(String)
        })
      );
    });
  });
});
