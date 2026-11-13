const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: ITCourse (Bảng `it_courses`)
 */
const ITCourse = createSQLModel('ITCourse', 'it_courses', {
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
    default: ''
  },
  category: {
    type: 'VARCHAR(100)',
    required: true,
    default: 'web'
  },
  icon: {
    type: 'VARCHAR(100)',
    default: 'fas fa-code'
  },
  color: {
    type: 'VARCHAR(50)',
    default: '#6366f1'
  },
  level: {
    type: 'VARCHAR(100)',
    default: 'Cơ bản - Trung cấp'
  },
  description: {
    type: 'TEXT',
    required: true
  },
  topics: {
    type: 'JSON',
    default: () => []
  },
  keyVocab: {
    type: 'JSON',
    default: () => []
  }
});

module.exports = ITCourse;
