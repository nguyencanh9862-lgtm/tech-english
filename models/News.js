const mongoose = require('mongoose');

const KeyVocabItemSchema = new mongoose.Schema({
  word: { type: String, required: true },
  phonetic: { type: String, default: '' },
  meaning: { type: String, required: true },
  example: { type: String, default: '' }
}, { _id: false });

const NewsSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'ai' // 'ai', 'dev', 'security', 'cloud', 'career'
  },
  categoryLabel: {
    type: String,
    default: 'Trí tuệ nhân tạo'
  },
  image: {
    type: String,
    default: ''
  },
  readTime: {
    type: String,
    default: '5 phút đọc'
  },
  author: {
    type: String,
    default: 'Ban biên tập TechEnglish'
  },
  views: {
    type: Number,
    default: 120
  },
  keyVocab: [KeyVocabItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('News', NewsSchema);
