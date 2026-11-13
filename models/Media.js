const { createSQLModel } = require('./sqlModel');

/**
 * MySQL Model: Media (Bảng `media`)
 */
const Media = createSQLModel('Media', 'media', {
  filename: {
    type: 'VARCHAR(255)',
    required: true,
    unique: true
  },
  originalname: {
    type: 'VARCHAR(255)',
    required: true
  },
  mimetype: {
    type: 'VARCHAR(100)',
    required: true
  },
  size: {
    type: 'INT',
    required: true
  },
  url: {
    type: 'VARCHAR(500)',
    required: true
  }
});

module.exports = Media;
