const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['vocabulary', 'grammar', 'listening', 'mixed']
  },
  q: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  answer: {
    type: Number,
    required: true
  },
  audio: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);
