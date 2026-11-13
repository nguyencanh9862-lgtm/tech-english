const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: User (Bảng `users`)
 */
const User = createSQLModel('User', 'users', {
  name: {
    type: 'VARCHAR(255)',
    required: true,
    trim: true
  },
  email: {
    type: 'VARCHAR(255)',
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: 'VARCHAR(255)',
    default: null
  },
  avatar: {
    type: 'VARCHAR(500)',
    default: ''
  },
  googleId: {
    type: 'VARCHAR(255)',
    default: null
  },
  authProvider: {
    type: 'ENUM',
    enum: ['google', 'local'],
    default: 'local'
  },
  role: {
    type: 'ENUM',
    enum: ['user', 'admin'],
    default: 'user'
  },
  xp: {
    type: 'INT',
    default: 0
  },
  streak: {
    type: 'INT',
    default: 0
  },
  learnedWords: {
    type: 'JSON',
    default: () => []
  },
  earnedBadges: {
    type: 'JSON',
    default: () => []
  },
  lastActive: {
    type: 'DATETIME',
    default: () => new Date()
  }
});

module.exports = User;
