const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: Course (Bảng `courses`)
 */
const Course = createSQLModel('Course', 'courses', {
  id: {
    type: 'INT',
    required: true,
    unique: true
  },
  title: {
    type: 'VARCHAR(500)',
    required: true,
    trim: true
  },
  titleEn: {
    type: 'VARCHAR(500)',
    default: '',
    trim: true
  },
  category: {
    type: 'VARCHAR(100)',
    required: true,
    default: 'communication'
  },
  level: {
    type: 'VARCHAR(100)',
    default: 'Cơ bản (A1-A2)'
  },
  description: {
    type: 'TEXT',
    required: true
  },
  instructor: {
    type: 'VARCHAR(255)',
    default: 'EnglishMaster Team'
  },
  thumbnail: {
    type: 'VARCHAR(500)',
    default: ''
  },
  youtubeUrl: {
    type: 'VARCHAR(500)',
    default: ''
  },
  youtubeId: {
    type: 'VARCHAR(100)',
    default: ''
  },
  badge: {
    type: 'VARCHAR(100)',
    default: 'Mới nhất'
  },
  views: {
    type: 'INT',
    default: 0
  },
  rating: {
    type: 'FLOAT',
    default: 5.0
  },
  lessons: {
    type: 'JSON',
    default: () => []
  }
});

module.exports = Course;
