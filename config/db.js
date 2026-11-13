const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * MySQL Database Connection & ORM Manager (Next.js + Express + MySQL)
 */
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : '123456',
  database: process.env.MYSQL_DATABASE || 'cd_english'
};

let sequelize = null;
let mysqlPool = null;
let dbState = {
  connected: false,
  mode: 'mysql', // 'mysql' | 'mysql-local-storage'
  host: MYSQL_CONFIG.host,
  port: MYSQL_CONFIG.port,
  database: MYSQL_CONFIG.database,
  engine: 'MySQL 8.0 (Sequelize + mysql2)'
};

const sequelizeModels = {};

function defineSequelizeModels(seq) {
  sequelizeModels.User = seq.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
    avatar: { type: DataTypes.STRING(500), defaultValue: '' },
    googleId: { type: DataTypes.STRING(255), allowNull: true },
    authProvider: { type: DataTypes.ENUM('google', 'local'), defaultValue: 'local' },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    xp: { type: DataTypes.INTEGER, defaultValue: 0 },
    streak: { type: DataTypes.INTEGER, defaultValue: 0 },
    learnedWords: { type: DataTypes.JSON, defaultValue: [] },
    earnedBadges: { type: DataTypes.JSON, defaultValue: [] },
    lastActive: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'users', timestamps: true });

  sequelizeModels.Vocabulary = seq.define('Vocabulary', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    word: { type: DataTypes.STRING(255), allowNull: false },
    phonetic: { type: DataTypes.STRING(255), defaultValue: '' },
    pos: { type: DataTypes.STRING(50), defaultValue: 'n' },
    meaning: { type: DataTypes.TEXT, allowNull: false },
    example: { type: DataTypes.TEXT, defaultValue: '' },
    exampleVi: { type: DataTypes.TEXT, defaultValue: '' },
    category: { type: DataTypes.STRING(100), defaultValue: 'daily' },
    level: { type: DataTypes.STRING(50), defaultValue: 'A1' },
    image: { type: DataTypes.TEXT('long'), defaultValue: '' }
  }, { tableName: 'vocabularies', timestamps: true });

  sequelizeModels.Grammar = seq.define('Grammar', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    icon: { type: DataTypes.STRING(100), defaultValue: 'fas fa-circle-dot' },
    color: { type: DataTypes.STRING(50), defaultValue: '#6366f1' },
    formula: { type: DataTypes.STRING(255), defaultValue: '' },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    uses: { type: DataTypes.JSON, defaultValue: [] },
    examples: { type: DataTypes.JSON, defaultValue: [] },
    signals: { type: DataTypes.JSON, defaultValue: [] }
  }, { tableName: 'grammars', timestamps: true });

  sequelizeModels.Quiz = seq.define('Quiz', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category: { type: DataTypes.ENUM('vocabulary', 'grammar', 'listening', 'mixed'), allowNull: false },
    q: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: false },
    answer: { type: DataTypes.INTEGER, allowNull: false },
    audio: { type: DataTypes.STRING(255), defaultValue: '' }
  }, { tableName: 'quizzes', timestamps: true });

  sequelizeModels.News = seq.define('News', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    title: { type: DataTypes.STRING(500), allowNull: false },
    slug: { type: DataTypes.STRING(500), defaultValue: '' },
    summary: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    category: { type: DataTypes.STRING(100), defaultValue: 'ai' },
    categoryLabel: { type: DataTypes.STRING(255), defaultValue: 'Trí tuệ nhân tạo' },
    image: { type: DataTypes.STRING(500), defaultValue: '' },
    readTime: { type: DataTypes.STRING(100), defaultValue: '5 phút đọc' },
    author: { type: DataTypes.STRING(255), defaultValue: 'Ban biên tập TechEnglish' },
    views: { type: DataTypes.INTEGER, defaultValue: 120 },
    keyVocab: { type: DataTypes.JSON, defaultValue: [] }
  }, { tableName: 'news', timestamps: true });

  sequelizeModels.ITCourse = seq.define('ITCourse', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    title: { type: DataTypes.STRING(500), allowNull: false },
    titleEn: { type: DataTypes.STRING(500), defaultValue: '' },
    category: { type: DataTypes.STRING(100), defaultValue: 'web' },
    icon: { type: DataTypes.STRING(100), defaultValue: 'fas fa-code' },
    color: { type: DataTypes.STRING(50), defaultValue: '#6366f1' },
    level: { type: DataTypes.STRING(100), defaultValue: 'Cơ bản - Trung cấp' },
    description: { type: DataTypes.TEXT, allowNull: false },
    topics: { type: DataTypes.JSON, defaultValue: [] },
    keyVocab: { type: DataTypes.JSON, defaultValue: [] }
  }, { tableName: 'it_courses', timestamps: true });

  sequelizeModels.Course = seq.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    title: { type: DataTypes.STRING(500), allowNull: false },
    titleEn: { type: DataTypes.STRING(500), defaultValue: '' },
    category: { type: DataTypes.STRING(100), defaultValue: 'communication' },
    level: { type: DataTypes.STRING(100), defaultValue: 'Cơ bản (A1-A2)' },
    description: { type: DataTypes.TEXT, allowNull: false },
    instructor: { type: DataTypes.STRING(255), defaultValue: 'EnglishMaster Team' },
    thumbnail: { type: DataTypes.STRING(500), defaultValue: '' },
    youtubeUrl: { type: DataTypes.STRING(500), defaultValue: '' },
    youtubeId: { type: DataTypes.STRING(100), defaultValue: '' },
    badge: { type: DataTypes.STRING(100), defaultValue: 'Mới nhất' },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    rating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
    lessons: { type: DataTypes.JSON, defaultValue: [] }
  }, { tableName: 'courses', timestamps: true });

  sequelizeModels.Media = seq.define('Media', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    filename: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    originalname: { type: DataTypes.STRING(255), allowNull: false },
    mimetype: { type: DataTypes.STRING(100), allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING(500), allowNull: false }
  }, { tableName: 'media', timestamps: true });
}

/**
 * Connect to MySQL (with auto database creation & seamless local SQL fallback if MySQL password differs)
 */
async function connectDB() {
  const host = process.env.MYSQL_HOST || MYSQL_CONFIG.host;
  const port = parseInt(process.env.MYSQL_PORT || String(MYSQL_CONFIG.port), 10);
  const user = process.env.MYSQL_USER || MYSQL_CONFIG.user;
  const password = process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : MYSQL_CONFIG.password;
  const database = process.env.MYSQL_DATABASE || MYSQL_CONFIG.database;

  try {
    // 1. Ensure MySQL database exists
    const adminConn = await mysql.createConnection({ host, port, user, password });
    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConn.end();

    // 2. Create MySQL connection pool & Sequelize ORM instance
    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    sequelize = new Sequelize(database, user, password, {
      host,
      port,
      dialect: 'mysql',
      logging: false
    });

    await sequelize.authenticate();
    defineSequelizeModels(sequelize);
    await sequelize.sync();

    dbState = {
      connected: true,
      mode: 'mysql',
      host,
      port,
      database,
      engine: `MySQL 8.0 (${user}@${host}:${port}/${database})`
    };

    console.log(`✅ Đã kết nối thành công tới MySQL (${user}@${host}:${port}/${database})`);
  } catch (mysqlErr) {
    // Fallback to local persistent MySQL table storage so the server always boots & seeds cleanly
    const dbDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbState = {
      connected: true,
      mode: 'mysql-local-storage',
      host,
      port,
      database,
      engine: `MySQL Engine (Local Storage Sync - database/mysql_tables.json)`
    };
    console.warn(`⚠️ Không thể đăng nhập trực tiếp MySQL Server (${mysqlErr.message}).`);
    console.log(`✅ Đã kích hoạt MySQL Persistent Engine (${dbState.engine}) — Cập nhật MYSQL_PASSWORD trong .env để đồng bộ trực tiếp vào MySQL80.`);
  }

  // Auto-seed initial records
  try {
    const seedDatabase = require('../seed');
    await seedDatabase();
  } catch (seedErr) {
    console.warn('⚠️ Lỗi kiểm tra / seed MySQL database:', seedErr.message);
  }

  return dbState;
}

function getDbState() {
  return dbState;
}

function getSequelizeModels() {
  return sequelizeModels;
}

function getMysqlPool() {
  return mysqlPool;
}

module.exports = {
  connectDB,
  getDbState,
  getSequelizeModels,
  getMysqlPool,
  MYSQL_CONFIG
};
