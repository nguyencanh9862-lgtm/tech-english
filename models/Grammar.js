const mongoose = require('mongoose');

const GrammarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'fas fa-circle-dot'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  formula: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  uses: [{
    type: String
  }],
  examples: [{
    en: String,
    vi: String
  }],
  signals: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Grammar', GrammarSchema);
