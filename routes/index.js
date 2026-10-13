const express = require('express');
const router = express.Router();

const vocabRoutes = require('./vocabRoutes');
const grammarRoutes = require('./grammarRoutes');
const quizRoutes = require('./quizRoutes');
const statsRoutes = require('./statsRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const newsRoutes = require('./newsRoutes');
const itRoutes = require('./itRoutes');
const courseRoutes = require('./courseRoutes');
const sheetRoutes = require('./sheetRoutes');
const uploadRoutes = require('./uploadRoutes');
const systemRoutes = require('./systemRoutes');

// Mount sub-routers
router.use('/vocab', vocabRoutes);
router.use('/grammar', grammarRoutes);
router.use('/quiz', quizRoutes);
router.use('/stats', statsRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/news', newsRoutes);
router.use('/it', itRoutes);
router.use('/courses', courseRoutes);
router.use('/sheets', sheetRoutes);
router.use('/', uploadRoutes);
router.use('/', systemRoutes);

module.exports = router;
