const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const { connectDB } = require('./config/db');
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

// Request Parameter Sanitization
app.use(mongoSanitizeMiddleware);

// Rate Limiting
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/sheets', sheetLimiter);

// Configure View Engine (View Layer - EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend and admin static files (Views & Assets)
app.use(express.static(__dirname));

// View & Navigation Routes (MVC Views)
app.use('/', require('./routes/viewRoutes'));

// API Routes (Express RESTful API + MySQL Models)
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
app.use('/api', require('./routes/systemRoutes'));

// Centralized error handling for API routes
app.use(errorHandler);

// Connect to MySQL, initialize Next.js App Router, and start Express server
if (require.main === module) {
  (async () => {
    try {
      await connectDB();

      // Integrate Next.js App Router on the same Express server
      try {
        const next = require('next');
        const dev = process.env.NODE_ENV !== 'production';
        const nextApp = next({ dev, dir: __dirname });
        const handle = nextApp.getRequestHandler();
        await nextApp.prepare();

        app.all(/^\/(_next|nextjs|vocab|courses|grammar|quiz|it|news)(\/.*)?$/, (req, res) => {
          return handle(req, res);
        });
        console.log('⚡ Đã tích hợp thành công Next.js App Router vào Express Server!');
      } catch (nextErr) {
        console.warn('⚠️ Không thể khởi tạo Next.js middleware:', nextErr.message);
      }

      app.listen(PORT, () => {
        console.log(`🚀 Server (Next.js + Express + MySQL) đang chạy tại: http://localhost:${PORT}`);
        console.log(`⚡ Giao diện Next.js App Router: http://localhost:${PORT}/nextjs`);
        console.log(`🌐 Website Full Studio:         http://localhost:${PORT}/index.html`);
        console.log(`📑 MVC View Server:             http://localhost:${PORT}/mvc`);
        console.log(`⚙️ Trang Admin (MySQL):         http://localhost:${PORT}/admin/index.html`);
        console.log(`📁 Thư mục Upload:              http://localhost:${PORT}/uploads`);
      });
    } catch (err) {
      console.error('❌ Không thể khởi động hệ thống:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = app;
