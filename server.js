const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cd_english';

const { helmetMiddleware, mongoSanitizeMiddleware } = require('./middleware/security');
const { generalLimiter, authLimiter, uploadLimiter, sheetLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Security HTTP Headers (Helmet)
app.use(helmetMiddleware);

// CORS Protection
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Chặn bởi chính sách bảo mật CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parser with payload size limit (Anti DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// NoSQL Injection Sanitization
app.use(mongoSanitizeMiddleware);

// Rate Limiting
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/sheets', sheetLimiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend and admin static files
app.use(express.static(__dirname));

// API Routes
app.use('/api/vocab', require('./routes/vocabRoutes'));
app.use('/api/grammar', require('./routes/grammarRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/it', require('./routes/itRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/sheets', require('./routes/sheetRoutes'));
app.use('/api', require('./routes/uploadRoutes'));

// Friendly redirect
app.get('/admin', (req, res) => {
  res.redirect('/admin/index.html');
});

// Health check / API status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling
app.use(errorHandler);

// Connect to MongoDB and start server if executed directly
if (require.main === module) {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log(`✅ Đã kết nối thành công tới MongoDB (${MONGODB_URI})`);

      // Auto-seed if database is empty
      try {
        const seedDatabase = require('./seed');
        await seedDatabase();
      } catch (seedErr) {
        console.warn('⚠️ Lỗi kiểm tra / seed database:', seedErr.message);
      }

      app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        console.log(`🌐 Website người dùng: http://localhost:${PORT}/index.html`);
        console.log(`⚙️ Trang Admin:       http://localhost:${PORT}/admin/index.html`);
        console.log(`📁 Thư mục Upload:    http://localhost:${PORT}/uploads`);
      });
    })
    .catch((err) => {
      console.error('❌ Không thể kết nối tới MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;
