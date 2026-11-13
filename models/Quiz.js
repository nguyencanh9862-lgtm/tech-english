const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: Quiz (Bảng `quizzes`)
 */
const Quiz = createSQLModel('Quiz', 'quizzes', {
  category: {
    type: 'ENUM',
    required: true,
    enum: ['vocabulary', 'grammar', 'listening', 'mixed']
  },
  q: {
    type: 'TEXT',
    required: true
  },
  options: {
    type: 'JSON',
    default: () => []
  },
  answer: {
    type: 'INT',
    required: true
  },
  audio: {
    type: 'VARCHAR(255)',
    default: ''
  }
});

module.exports = Quiz;
