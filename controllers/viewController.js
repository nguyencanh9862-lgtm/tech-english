const path = require('path');
const Vocabulary = require('../models/Vocabulary');
const Course = require('../models/Course');
const News = require('../models/News');
const Grammar = require('../models/Grammar');
const Quiz = require('../models/Quiz');
const ITCourse = require('../models/ITCourse');
const User = require('../models/User');
const Media = require('../models/Media');

/**
 * Controller điều phối hiển thị Giao diện (Views)
 * Hiện thực đúng 100% mô hình MVC Tam Giác:
 *
 *               Controller
 *               /        \
 *   (1. Điều phối)      (2. Tác động / Truy vấn)
 *             v            v
 *           View  <------ Model
 *       (3. Model đổ dữ liệu trực tiếp vào View)
 */

// 1. Render Trang chủ: Controller gọi Models -> Đổ dữ liệu vào home.ejs
async function renderHome(req, res) {
  try {
    const [vocabList, courses, newsList, vocabCount, courseCount] = await Promise.all([
      Vocabulary.find().sort({ id: 1 }).limit(8),
      Course.find().sort({ id: 1 }).limit(6),
      News.find().sort({ id: 1 }).limit(4),
      Vocabulary.countDocuments(),
      Course.countDocuments()
    ]);

    res.render('home', {
      title: 'Trang Chủ - TechEnglish MVC',
      vocabList,
      courses,
      newsList,
      stats: { vocabCount, courseCount }
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải giao diện: ' + error.message);
  }
}

// 2. Render Từ vựng: Controller truy vấn Vocabulary Model -> Đổ dữ liệu vào vocab.ejs
async function renderVocab(req, res) {
  try {
    const vocabList = await Vocabulary.find().sort({ id: 1 });
    res.render('vocab', {
      title: 'Kho Từ Vựng - TechEnglish MVC',
      vocabList
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải từ vựng: ' + error.message);
  }
}

// 3. Render Khóa học: Controller truy vấn Course Model -> Đổ dữ liệu vào courses.ejs
async function renderCourses(req, res) {
  try {
    const courses = await Course.find().sort({ id: 1 });
    res.render('courses', {
      title: 'Khóa Học Video - TechEnglish MVC',
      courses
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải khóa học: ' + error.message);
  }
}

// 4. Render Ngữ pháp: Controller truy vấn Grammar Model -> Đổ dữ liệu vào grammar.ejs
async function renderGrammar(req, res) {
  try {
    const grammarList = await Grammar.find();
    res.render('grammar', {
      title: 'Bài Học Ngữ Pháp - TechEnglish MVC',
      grammarList
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải bài học ngữ pháp: ' + error.message);
  }
}

// 5. Render Quiz: Controller truy vấn Quiz Model -> Nhóm và đổ dữ liệu vào quiz.ejs
async function renderQuiz(req, res) {
  try {
    const quizList = await Quiz.find();
    const groupedQuizzes = {
      vocabulary: [],
      grammar: [],
      listening: [],
      mixed: []
    };

    quizList.forEach(q => {
      if (groupedQuizzes[q.category]) {
        groupedQuizzes[q.category].push(q);
      } else {
        groupedQuizzes.mixed.push(q);
      }
    });

    res.render('quiz', {
      title: 'Luyện Tập Trắc Nghiệm - TechEnglish MVC',
      groupedQuizzes
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải câu hỏi trắc nghiệm: ' + error.message);
  }
}

// 6. Render Tin tức: Controller truy vấn News Model -> Đổ dữ liệu vào news.ejs
async function renderNews(req, res) {
  try {
    const newsList = await News.find().sort({ id: 1 });
    res.render('news', {
      title: 'Tin Tức Công Nghệ - TechEnglish MVC',
      newsList
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải tin tức: ' + error.message);
  }
}

// 7. Render IT Academy: Controller truy vấn ITCourse Model -> Đổ dữ liệu vào it.ejs
async function renderIT(req, res) {
  try {
    const itCourses = await ITCourse.find().sort({ id: 1 });
    let itTerms = [];
    itCourses.forEach(c => {
      if (c.keyVocab && c.keyVocab.length > 0) {
        c.keyVocab.forEach(v => {
          itTerms.push({
            ...v.toObject(),
            courseTitle: c.title
          });
        });
      }
    });

    res.render('it', {
      title: 'IT Academy & Thuật Ngữ - TechEnglish MVC',
      itCourses,
      itTerms
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải dữ liệu CNTT: ' + error.message);
  }
}

// 8. Render Admin: Controller truy vấn User & Stats Models -> Đổ dữ liệu vào admin.ejs
async function renderAdmin(req, res) {
  try {
    const [vocabCount, courseCount, grammarCount, quizCount, userCount, users] = await Promise.all([
      Vocabulary.countDocuments(),
      Course.countDocuments(),
      Grammar.countDocuments(),
      Quiz.countDocuments(),
      User.countDocuments(),
      User.find().select('-password').sort({ createdAt: -1 })
    ]);

    res.render('admin', {
      title: 'Bảng Quản Trị - TechEnglish MVC',
      stats: { vocabCount, courseCount, grammarCount, quizCount, userCount },
      users
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải trang quản trị: ' + error.message);
  }
}

// 9. Render Đăng nhập
function renderLogin(req, res) {
  res.render('login', {
    title: 'Đăng Nhập - TechEnglish MVC'
  });
}

// Điều hướng thân thiện tới trang Admin Panel tĩnh
function getAdminView(req, res) {
  res.redirect('/admin/index.html');
}

// Trả về giao diện tĩnh Single Page Application
function getHomeView(req, res) {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
}

module.exports = {
  renderHome,
  renderVocab,
  renderCourses,
  renderGrammar,
  renderQuiz,
  renderNews,
  renderIT,
  renderAdmin,
  renderLogin,
  getAdminView,
  getHomeView
};
