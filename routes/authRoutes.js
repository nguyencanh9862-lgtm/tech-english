const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const { JWT_SECRET, authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePassword, validateEmail } = require('../middleware/security');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// GET /api/auth/config - Get public auth config
router.get('/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// POST /api/auth/google - Sign in / register with Google
router.post('/google', async (req, res) => {
  try {
    const { credential, profile } = req.body;
    let googleUser = null;

    if (credential) {
      // If credential token from Google Identity Services
      if (GOOGLE_CLIENT_ID && client) {
        try {
          const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          googleUser = {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture || '',
            sub: payload.sub
          };
        } catch (verifyErr) {
          console.warn('Google verifyIdToken failed, falling back to decode:', verifyErr.message);
        }
      }

      // If client verification not possible (or decode directly)
      if (!googleUser) {
        try {
          // Decode payload from JWT
          const parts = credential.split('.');
          if (parts.length === 3) {
            const buff = Buffer.from(parts[1], 'base64');
            const payload = JSON.parse(buff.toString('utf-8'));
            if (payload && payload.email) {
              googleUser = {
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                picture: payload.picture || '',
                sub: payload.sub
              };
            }
          }
        } catch (e) {
          console.warn('Decode credential error:', e.message);
        }
      }
    } else if (profile) {
      // Direct profile (e.g. mock / test Google login flow)
      googleUser = {
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        picture: profile.picture || profile.avatar || '',
        sub: profile.sub || profile.id || ('google-' + Date.now())
      };
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Không nhận được thông tin tài khoản Google hợp lệ'
      });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (user) {
      // Update Google info
      user.googleId = googleUser.sub;
      if (!user.avatar && googleUser.picture) {
        user.avatar = googleUser.picture;
      }
      user.lastActive = new Date();
      await user.save();
    } else {
      // Create new Google user
      user = new User({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        avatar: googleUser.picture,
        googleId: googleUser.sub,
        authProvider: 'google',
        role: 'user',
        xp: 0,
        streak: 1,
        learnedWords: [],
        earnedBadges: []
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập Google thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
        learnedWords: user.learnedWords,
        earnedBadges: user.earnedBadges
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập Google:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// POST /api/auth/register - Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ họ tên, email và mật khẩu' });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: 'local',
      role: 'user',
      xp: 0,
      streak: 1
    });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
        learnedWords: user.learnedWords,
        earnedBadges: user.earnedBadges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login - Local login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Special check for default admin credentials
    if (email === 'admin' || email === 'admin@englishmaster.vn') {
      let adminUser = await User.findOne({ email: 'admin@englishmaster.vn' });
      if (!adminUser) {
        const hashedAdminPass = await bcrypt.hash('admin123', 10);
        adminUser = new User({
          name: 'Quản trị viên',
          email: 'admin@englishmaster.vn',
          password: hashedAdminPass,
          role: 'admin',
          authProvider: 'local'
        });
        await adminUser.save();
      }

      // Check password using bcrypt or fallback for existing plain admin
      const isMatch = adminUser.password
        ? await bcrypt.compare(password, adminUser.password)
        : password === 'admin123';

      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Tài khoản hoặc mật khẩu không đúng' });
      }

      const token = jwt.sign({ id: adminUser._id, email: adminUser.email, role: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        success: true,
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          avatar: adminUser.avatar,
          role: 'admin'
        }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
        learnedWords: user.learnedWords,
        earnedBadges: user.earnedBadges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      authProvider: req.user.authProvider,
      role: req.user.role,
      xp: req.user.xp,
      streak: req.user.streak,
      learnedWords: req.user.learnedWords,
      earnedBadges: req.user.earnedBadges,
      createdAt: req.user.createdAt
    }
  });
});

// PUT /api/auth/progress - Sync learning progress to MongoDB
router.put('/progress', authenticateToken, async (req, res) => {
  try {
    const { xp, streak, learnedWords, earnedBadges } = req.body;
    const user = req.user;

    if (xp !== undefined) user.xp = xp;
    if (streak !== undefined) user.streak = streak;
    if (learnedWords !== undefined) user.learnedWords = learnedWords;
    if (earnedBadges !== undefined) user.earnedBadges = earnedBadges;
    user.lastActive = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Đã lưu tiến độ học tập vào database',
      user: {
        xp: user.xp,
        streak: user.streak,
        learnedWords: user.learnedWords,
        earnedBadges: user.earnedBadges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/change-password - Change user password securely
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Tài khoản đăng nhập mạng xã hội không hỗ trợ đổi mật khẩu tại đây' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;
