const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: Vocabulary (Bảng `vocabularies`)
 */
const Vocabulary = createSQLModel('Vocabulary', 'vocabularies', {
  id: {
    type: 'INT',
    required: true,
    unique: true
  },
  word: {
    type: 'VARCHAR(255)',
    required: true,
    trim: true
  },
  phonetic: {
    type: 'VARCHAR(255)',
    default: ''
  },
  pos: {
    type: 'VARCHAR(50)',
    required: true,
    default: 'n'
  },
  meaning: {
    type: 'TEXT',
    required: true,
    trim: true
  },
  example: {
    type: 'TEXT',
    default: ''
  },
  exampleVi: {
    type: 'TEXT',
    default: ''
  },
  category: {
    type: 'VARCHAR(100)',
    required: true,
    default: 'daily'
  },
  level: {
    type: 'VARCHAR(50)',
    required: true,
    default: 'A1'
  },
  image: {
    type: 'LONGTEXT',
    default: ''
  }
});

module.exports = Vocabulary;
