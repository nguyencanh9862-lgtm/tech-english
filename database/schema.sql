-- ============================================================================
-- MÊ LINH / CD ENGLISH - MYSQL DATABASE SCHEMA (MySQL 8.0+)
-- Architecture: Next.js + Express + MySQL (Sequelize / mysql2)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `cd_english`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `cd_english`;

-- 1. Bảng Người Dùng (users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) DEFAULT NULL,
  `avatar` VARCHAR(500) DEFAULT '',
  `googleId` VARCHAR(255) DEFAULT NULL,
  `authProvider` ENUM('google', 'local') DEFAULT 'local',
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `xp` INT DEFAULT 0,
  `streak` INT DEFAULT 0,
  `learnedWords` JSON DEFAULT NULL,
  `earnedBadges` JSON DEFAULT NULL,
  `lastActive` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Từ Vựng (vocabularies)
CREATE TABLE IF NOT EXISTS `vocabularies` (
  `id` INT PRIMARY KEY,
  `word` VARCHAR(255) NOT NULL,
  `phonetic` VARCHAR(255) DEFAULT '',
  `pos` VARCHAR(50) NOT NULL DEFAULT 'n',
  `meaning` TEXT NOT NULL,
  `example` TEXT,
  `exampleVi` TEXT,
  `category` VARCHAR(100) NOT NULL DEFAULT 'daily',
  `level` VARCHAR(50) NOT NULL DEFAULT 'A1',
  `image` LONGTEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vocab_category` (`category`),
  INDEX `idx_vocab_level` (`level`),
  INDEX `idx_vocab_word` (`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Ngữ Pháp (grammars)
CREATE TABLE IF NOT EXISTS `grammars` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(100) DEFAULT 'fas fa-circle-dot',
  `color` VARCHAR(50) DEFAULT '#6366f1',
  `formula` VARCHAR(255) DEFAULT '',
  `description` TEXT,
  `uses` JSON DEFAULT NULL,
  `examples` JSON DEFAULT NULL,
  `signals` JSON DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Câu Hỏi Trắc Nghiệm (quizzes)
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('vocabulary', 'grammar', 'listening', 'mixed') NOT NULL,
  `q` TEXT NOT NULL,
  `options` JSON NOT NULL,
  `answer` INT NOT NULL,
  `audio` VARCHAR(255) DEFAULT '',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_quiz_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Tin Tức Công Nghệ (news)
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) DEFAULT '',
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'ai',
  `categoryLabel` VARCHAR(255) DEFAULT 'Trí tuệ nhân tạo',
  `image` VARCHAR(500) DEFAULT '',
  `readTime` VARCHAR(100) DEFAULT '5 phút đọc',
  `author` VARCHAR(255) DEFAULT 'Ban biên tập TechEnglish',
  `views` INT DEFAULT 120,
  `keyVocab` JSON DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_news_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Khóa Học CNTT & Thuật Ngữ (it_courses)
CREATE TABLE IF NOT EXISTS `it_courses` (
  `id` INT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `titleEn` VARCHAR(500) DEFAULT '',
  `category` VARCHAR(100) NOT NULL DEFAULT 'web',
  `icon` VARCHAR(100) DEFAULT 'fas fa-code',
  `color` VARCHAR(50) DEFAULT '#6366f1',
  `level` VARCHAR(100) DEFAULT 'Cơ bản - Trung cấp',
  `description` TEXT NOT NULL,
  `topics` JSON DEFAULT NULL,
  `keyVocab` JSON DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_it_courses_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng Khóa Học Video Tiếng Anh (courses)
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `titleEn` VARCHAR(500) DEFAULT '',
  `category` VARCHAR(100) NOT NULL DEFAULT 'communication',
  `level` VARCHAR(100) DEFAULT 'Cơ bản (A1-A2)',
  `description` TEXT NOT NULL,
  `instructor` VARCHAR(255) DEFAULT 'EnglishMaster Team',
  `thumbnail` VARCHAR(500) DEFAULT '',
  `youtubeUrl` VARCHAR(500) DEFAULT '',
  `youtubeId` VARCHAR(100) DEFAULT '',
  `badge` VARCHAR(100) DEFAULT 'Mới nhất',
  `views` INT DEFAULT 0,
  `rating` FLOAT DEFAULT 5.0,
  `lessons` JSON DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_courses_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Thư Viện Ảnh Tải Lên (media)
CREATE TABLE IF NOT EXISTS `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL UNIQUE,
  `originalname` VARCHAR(255) NOT NULL,
  `mimetype` VARCHAR(100) NOT NULL,
  `size` INT NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
