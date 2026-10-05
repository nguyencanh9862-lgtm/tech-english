const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  enTerm: { type: String, default: '' },
  viDesc: { type: String, required: true },
  enExplanation: { type: String, default: '' },
  codeSnippet: { type: String, default: '' },
  practicalTip: { type: String, default: '' }
}, { _id: false });

const ITCourseSchema = new mongoose.Schema({
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
  titleEn: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'web' // 'web', 'backend', 'dsa', 'devops', 'ai', 'security'
  },
  icon: {
    type: String,
    default: 'fas fa-code'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  level: {
    type: String,
    default: 'Cơ bản - Trung cấp'
  },
  description: {
    type: String,
    required: true
  },
  topics: [TopicSchema],
  keyVocab: [{
    word: String,
    phonetic: String,
    meaning: String,
    example: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ITCourse', ITCourseSchema);
