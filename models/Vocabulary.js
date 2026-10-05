const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  word: {
    type: String,
    required: true,
    trim: true
  },
  phonetic: {
    type: String,
    default: ''
  },
  pos: {
    type: String,
    required: true,
    default: 'n'
  },
  meaning: {
    type: String,
    required: true,
    trim: true
  },
  example: {
    type: String,
    default: ''
  },
  exampleVi: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'daily'
  },
  level: {
    type: String,
    required: true,
    default: 'A1'
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vocabulary', VocabularySchema);
