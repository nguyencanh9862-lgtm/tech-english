const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// Điều hướng Admin
router.get('/admin', viewController.getAdminView);

// Trang chủ MVC (Controller -> Models -> View home.ejs)
router.get('/mvc', viewController.renderHome);

// Từ vựng MVC (Controller -> Vocabulary Model -> View vocab.ejs)
router.get('/mvc/vocab', viewController.renderVocab);

// Khóa học MVC (Controller -> Course Model -> View courses.ejs)
router.get('/mvc/courses', viewController.renderCourses);

// Ngữ pháp MVC (Controller -> Grammar Model -> View grammar.ejs)
router.get('/mvc/grammar', viewController.renderGrammar);

// Trắc nghiệm MVC (Controller -> Quiz Model -> View quiz.ejs)
router.get('/mvc/quiz', viewController.renderQuiz);

// Tin tức công nghệ MVC (Controller -> News Model -> View news.ejs)
router.get('/mvc/news', viewController.renderNews);

// IT Academy & Thuật ngữ MVC (Controller -> ITCourse Model -> View it.ejs)
router.get('/mvc/it', viewController.renderIT);

// Quản trị viên MVC (Controller -> User & Stats Models -> View admin.ejs)
router.get('/mvc/admin', viewController.renderAdmin);

// Đăng nhập MVC
router.get('/mvc/login', viewController.renderLogin);

module.exports = router;
