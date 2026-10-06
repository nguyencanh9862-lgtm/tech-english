const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  youtubeUrl: { type: String, required: true, trim: true },
  youtubeId: { type: String, default: '' },
  duration: { type: String, default: '10:00' },
  description: { type: String, default: '' },
  order: { type: Number, default: 1 },
  vocabularies: [{
    word: { type: String, trim: true },
    phonetic: { type: String, default: '' },
    meaning: { type: String, trim: true },
    example: { type: String, default: '' }
  }]
}, { _id: false });

const CourseSchema = new mongoose.Schema({
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
    default: '',
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'communication' // communication, it, pronunciation, grammar, business, ielts
  },
  level: {
    type: String,
    default: 'Cơ bản (A1-A2)'
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    default: 'EnglishMaster Team'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  youtubeUrl: {
    type: String,
    default: ''
  },
  youtubeId: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: 'Mới nhất'
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0
  },
  lessons: [LessonSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);
