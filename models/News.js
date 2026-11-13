const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: News (Bảng `news`)
 */
const News = createSQLModel('News', 'news', {
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
  slug: {
    type: 'VARCHAR(500)',
    default: ''
  },
  summary: {
    type: 'TEXT',
    required: true
  },
  content: {
    type: 'LONGTEXT',
    required: true
  },
  category: {
    type: 'VARCHAR(100)',
    required: true,
    default: 'ai'
  },
  categoryLabel: {
    type: 'VARCHAR(255)',
    default: 'Trí tuệ nhân tạo'
  },
  image: {
    type: 'VARCHAR(500)',
    default: ''
  },
  readTime: {
    type: 'VARCHAR(100)',
    default: '5 phút đọc'
  },
  author: {
    type: 'VARCHAR(255)',
    default: 'Ban biên tập TechEnglish'
  },
  views: {
    type: 'INT',
    default: 120
  },
  keyVocab: {
    type: 'JSON',
    default: () => []
  }
});

module.exports = News;
