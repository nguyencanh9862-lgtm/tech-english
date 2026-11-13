const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: Grammar (Bảng `grammars`)
 */
const Grammar = createSQLModel('Grammar', 'grammars', {
  title: {
    type: 'VARCHAR(255)',
    required: true
  },
  icon: {
    type: 'VARCHAR(100)',
    default: 'fas fa-circle-dot'
  },
  color: {
    type: 'VARCHAR(50)',
    default: '#6366f1'
  },
  formula: {
    type: 'VARCHAR(255)',
    default: ''
  },
  description: {
    type: 'TEXT',
    default: ''
  },
  uses: {
    type: 'JSON',
    default: () => []
  },
  examples: {
    type: 'JSON',
    default: () => []
  },
  signals: {
    type: 'JSON',
    default: () => []
  }
});

module.exports = Grammar;
