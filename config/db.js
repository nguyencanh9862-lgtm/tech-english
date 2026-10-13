const mongoose = require('mongoose');

/**
 * Connect to MongoDB with connection pooling and error handling
 * @param {string} uri - MongoDB connection string
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cd_english';
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ Đã kết nối thành công tới MongoDB (${mongoUri})`);

    // Auto-seed if database is empty
    try {
      const seedDatabase = require('../seed');
      await seedDatabase();
    } catch (seedErr) {
      console.warn('⚠️ Lỗi kiểm tra / seed database:', seedErr.message);
    }

    return conn;
  } catch (error) {
    console.error('❌ Không thể kết nối tới MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = {
  connectDB
};
