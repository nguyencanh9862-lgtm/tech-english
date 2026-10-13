const Vocabulary = require('../models/Vocabulary');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const {
  parseGoogleSheetUrl,
  parseCsv,
  cleanHeader,
  mapVocabRow,
  mapCourseRow,
  mapQuizRow
} = require('../utils/sheetParser');

/**
 * Controller xử lý nghiệp vụ Đồng bộ và Đọc Google Sheets
 */

// POST /api/sheets/parse - Tải và phân tích Google Sheet thành dữ liệu xem trước
async function parseSheet(req, res) {
  try {
    const { url, type = 'vocab', gid } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp link Google Sheet' });
    }

    const parsed = parseGoogleSheetUrl(url);
    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: 'Link Google Sheet không hợp lệ. Vui lòng dán link dạng: https://docs.google.com/spreadsheets/d/.../edit'
      });
    }

    const sheetGid = gid || parsed.gid || '0';
    if (!/^[a-zA-Z0-9-_]+$/.test(parsed.sheetId) || !/^[0-9]+$/.test(String(sheetGid))) {
      return res.status(400).json({
        success: false,
        message: 'Mã định danh Google Sheet không hợp lệ'
      });
    }

    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${parsed.sheetId}/export?format=csv&gid=${sheetGid}`;

    const response = await fetch(csvExportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TechEnglish/2.0'
      }
    });

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: `Không thể đọc Google Sheet (Mã lỗi ${response.status}). Vui lòng đảm bảo bảng tính đã được bật quyền: 'Bất kỳ ai có đường liên kết đều có thể xem' (Anyone with the link can view).`
      });
    }

    const csvText = await response.text();
    if (!csvText || csvText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Bảng tính Google Sheet này đang trống.' });
    }

    const allRows = parseCsv(csvText);
    if (allRows.length < 2) {
      return res.status(400).json({ success: false, message: 'Bảng tính cần có ít nhất 1 hàng tiêu đề và 1 hàng dữ liệu.' });
    }

    const rawHeaders = allRows[0];
    const headerMap = {};
    rawHeaders.forEach((h, idx) => {
      headerMap[cleanHeader(h)] = idx;
    });

    const parsedItems = [];

    for (let r = 1; r < allRows.length; r++) {
      const row = allRows[r];
      let item = null;
      if (type === 'vocab') item = mapVocabRow(row, headerMap);
      else if (type === 'course') item = mapCourseRow(row, headerMap);
      else if (type === 'quiz') item = mapQuizRow(row, headerMap);

      if (item) parsedItems.push(item);
    }

    return res.json({
      success: true,
      sheetId: parsed.sheetId,
      gid: sheetGid,
      type,
      totalRows: allRows.length - 1,
      validCount: parsedItems.length,
      invalidCount: (allRows.length - 1) - parsedItems.length,
      headers: rawHeaders,
      preview: parsedItems.slice(0, 8),
      data: parsedItems
    });
  } catch (err) {
    console.error('Error parsing sheet:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi đọc Google Sheet: ' + err.message });
  }
}

// POST /api/sheets/sync - Đồng bộ dữ liệu bảng tính vào MongoDB
async function syncSheet(req, res) {
  try {
    const { type = 'vocab', mode = 'upsert', items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu hợp lệ để đồng bộ.' });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    if (type === 'vocab') {
      if (mode === 'replace') {
        await Vocabulary.deleteMany({});
      }

      const maxItem = await Vocabulary.findOne().sort('-id');
      let nextId = maxItem && maxItem.id ? maxItem.id + 1 : 1;

      for (const item of items) {
        if (!item.word || !item.meaning) {
          skipped++;
          continue;
        }

        const existing = await Vocabulary.findOne({ word: new RegExp(`^${item.word.trim()}$`, 'i') });

        if (existing) {
          if (mode === 'upsert') {
            existing.meaning = item.meaning;
            if (item.phonetic) existing.phonetic = item.phonetic;
            if (item.pos) existing.pos = item.pos;
            if (item.example) existing.example = item.example;
            if (item.exampleVi) existing.exampleVi = item.exampleVi;
            if (item.category) existing.category = item.category;
            if (item.level) existing.level = item.level;
            await existing.save();
            updated++;
          } else {
            skipped++;
          }
        } else {
          await Vocabulary.create({
            id: nextId++,
            word: item.word,
            phonetic: item.phonetic || '',
            pos: item.pos || 'n',
            meaning,
            example: item.example || '',
            exampleVi: item.exampleVi || '',
            category: item.category || 'daily',
            level: item.level || 'A2'
          });
          inserted++;
        }
      }
    } else if (type === 'course') {
      if (mode === 'replace') {
        await Course.deleteMany({});
      }

      const maxCourse = await Course.findOne().sort('-id');
      let nextId = maxCourse && maxCourse.id ? maxCourse.id + 1 : 1;

      for (const item of items) {
        if (!item.title) {
          skipped++;
          continue;
        }

        const existing = await Course.findOne({
          $or: [
            { title: new RegExp(`^${item.title.trim()}$`, 'i') },
            ...(item.youtubeId ? [{ youtubeId: item.youtubeId }] : [])
          ]
        });

        if (existing) {
          if (mode === 'upsert') {
            existing.title = item.title;
            if (item.titleEn) existing.titleEn = item.titleEn;
            if (item.category) existing.category = item.category;
            if (item.level) existing.level = item.level;
            if (item.description) existing.description = item.description;
            if (item.instructor) existing.instructor = item.instructor;
            if (item.youtubeUrl) existing.youtubeUrl = item.youtubeUrl;
            if (item.youtubeId) existing.youtubeId = item.youtubeId;
            if (item.thumbnail) existing.thumbnail = item.thumbnail;
            await existing.save();
            updated++;
          } else {
            skipped++;
          }
        } else {
          await Course.create({
            id: nextId++,
            title: item.title,
            titleEn: item.titleEn || '',
            category: item.category || 'communication',
            level: item.level || 'Cơ bản (A1-A2)',
            description: item.description,
            instructor: item.instructor || 'TechEnglish Coach',
            youtubeUrl: item.youtubeUrl || '',
            youtubeId: item.youtubeId || '',
            thumbnail: item.thumbnail || '',
            badge: item.badge || 'Mới cập nhật',
            views: 100,
            rating: 5.0,
            lessons: item.youtubeId ? [{
              id: 1,
              title: item.title,
              youtubeUrl: item.youtubeUrl,
              youtubeId: item.youtubeId,
              duration: item.duration || '15:00',
              description: item.description,
              order: 1,
              vocabularies: []
            }] : []
          });
          inserted++;
        }
      }
    } else if (type === 'quiz') {
      if (mode === 'replace') {
        await Quiz.deleteMany({});
      }

      for (const item of items) {
        if (!item.q || !item.options || item.options.length < 2) {
          skipped++;
          continue;
        }

        const existing = await Quiz.findOne({ q: new RegExp(`^${item.q.trim()}$`, 'i') });

        if (existing) {
          if (mode === 'upsert') {
            existing.options = item.options;
            existing.answer = item.answer;
            existing.category = item.category || 'vocabulary';
            await existing.save();
            updated++;
          } else {
            skipped++;
          }
        } else {
          await Quiz.create({
            category: item.category || 'vocabulary',
            q: item.q,
            options: item.options,
            answer: item.answer || 0
          });
          inserted++;
        }
      }
    }

    return res.json({
      success: true,
      message: `Đồng bộ thành công! Thêm mới: ${inserted}, Cập nhật: ${updated}, Bỏ qua: ${skipped}.`,
      stats: {
        total: items.length,
        inserted,
        updated,
        skipped
      }
    });
  } catch (err) {
    console.error('Error syncing sheet data:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi lưu dữ liệu vào cơ sở dữ liệu: ' + err.message });
  }
}

// GET /api/sheets/export/:type - Xuất dữ liệu ra file CSV
async function exportSheet(req, res) {
  try {
    const { type } = req.params;

    if (type === 'vocab') {
      const items = await Vocabulary.find().sort('id');
      let csv = '\uFEFF'; // UTF-8 BOM
      csv += 'Từ vựng,Phiên âm,Loại từ,Nghĩa,Ví dụ,Dịch ví dụ,Chủ đề,Cấp độ\n';
      items.forEach(i => {
        const row = [
          `"${(i.word || '').replace(/"/g, '""')}"`,
          `"${(i.phonetic || '').replace(/"/g, '""')}"`,
          `"${(i.pos || 'n').replace(/"/g, '""')}"`,
          `"${(i.meaning || '').replace(/"/g, '""')}"`,
          `"${(i.example || '').replace(/"/g, '""')}"`,
          `"${(i.exampleVi || '').replace(/"/g, '""')}"`,
          `"${(i.category || 'daily').replace(/"/g, '""')}"`,
          `"${(i.level || 'A2').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=TechEnglish_Vocab_Export.csv');
      return res.send(csv);
    } else if (type === 'course') {
      const courses = await Course.find().sort('id');
      let csv = '\uFEFF';
      csv += 'Tên khóa học,Tên tiếng Anh,Chuyên mục,Trình độ,Giảng viên,Link YouTube,Mô tả,Thời lượng\n';
      courses.forEach(c => {
        const row = [
          `"${(c.title || '').replace(/"/g, '""')}"`,
          `"${(c.titleEn || '').replace(/"/g, '""')}"`,
          `"${(c.category || 'communication').replace(/"/g, '""')}"`,
          `"${(c.level || '').replace(/"/g, '""')}"`,
          `"${(c.instructor || '').replace(/"/g, '""')}"`,
          `"${(c.youtubeUrl || '').replace(/"/g, '""')}"`,
          `"${(c.description || '').replace(/"/g, '""')}"`,
          `"${c.lessons && c.lessons[0] ? c.lessons[0].duration : '15:00'}"`
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=TechEnglish_Courses_Export.csv');
      return res.send(csv);
    } else if (type === 'quiz') {
      const quizzes = await Quiz.find().sort('createdAt');
      let csv = '\uFEFF';
      csv += 'Câu hỏi,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng (A/B/C/D),Chuyên mục\n';
      quizzes.forEach(q => {
        const opts = q.options || [];
        const ansLetters = ['A', 'B', 'C', 'D'];
        const ansLetter = ansLetters[q.answer] || 'A';
        const row = [
          `"${(q.q || '').replace(/"/g, '""')}"`,
          `"${(opts[0] || '').replace(/"/g, '""')}"`,
          `"${(opts[1] || '').replace(/"/g, '""')}"`,
          `"${(opts[2] || '').replace(/"/g, '""')}"`,
          `"${(opts[3] || '').replace(/"/g, '""')}"`,
          `"${ansLetter}"`,
          `"${(q.category || 'vocabulary').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=TechEnglish_Quiz_Export.csv');
      return res.send(csv);
    }

    return res.status(400).json({ success: false, message: 'Loại dữ liệu không hỗ trợ: ' + type });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi khi xuất dữ liệu: ' + err.message });
  }
}

// GET /api/sheets/sample/:type - Dữ liệu mẫu demo có sẵn
function getSampleData(req, res) {
  const { type } = req.params;

  if (type === 'vocab') {
    return res.json({
      success: true,
      sampleUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      sheetTitle: 'Bảng Từ Vựng Tiếng Anh Chuyên Ngành CNTT & Giao Tiếp (Demo)',
      data: [
        { word: 'Algorithm', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', pos: 'n', meaning: 'Thuật toán, quy trình từng bước giải quyết bài toán', example: 'A good algorithm saves server compute time.', exampleVi: 'Một thuật toán tốt tiết kiệm thời gian tính toán của máy chủ.', category: 'it', level: 'B1' },
        { word: 'Framework', phonetic: '/ˈfreɪm.wɜːk/', pos: 'n', meaning: 'Bộ khung sườn, thư viện cấu trúc phát triển phần mềm', example: 'React is an open-source JavaScript framework.', exampleVi: 'React là một framework JavaScript mã nguồn mở.', category: 'it', level: 'B1' },
        { word: 'Repository', phonetic: '/rɪˈpɒz.ɪ.tər.i/', pos: 'n', meaning: 'Kho lưu trữ mã nguồn (Repo trong Git)', example: 'Clone the repository to your local machine.', exampleVi: 'Hãy sao chép kho lưu trữ về máy tính cá nhân của bạn.', category: 'it', level: 'B2' },
        { word: 'Deploy', phonetic: '/dɪˈplɔɪ/', pos: 'v', meaning: 'Triển khai phần mềm lên máy chủ / môi trường production', example: 'We deploy the new release every Thursday.', exampleVi: 'Chúng tôi triển khai phiên bản mới vào mỗi thứ Năm.', category: 'it', level: 'B2' },
        { word: 'Fluency', phonetic: '/ˈfluː.ən.si/', pos: 'n', meaning: 'Sự trôi chảy, lưu loát khi nói ngoại ngữ', example: 'Practice every day to build English fluency.', exampleVi: 'Hãy luyện tập mỗi ngày để nâng cao sự lưu loát tiếng Anh.', category: 'daily', level: 'B2' },
        { word: 'Negotiate', phonetic: '/nəˈɡəʊ.ʃi.eɪt/', pos: 'v', meaning: 'Thương lượng, đàm phán hợp đồng hoặc lương bổng', example: 'She negotiated a higher salary offer.', exampleVi: 'Cô ấy đã thương lượng được mức đãi ngộ lương cao hơn.', category: 'business', level: 'B2' },
        { word: 'Perseverance', phonetic: '/ˌpɜː.sɪˈvɪə.rəns/', pos: 'n', meaning: 'Sự kiên trì, bền chí vượt qua thử thách', example: 'Success in coding requires patience and perseverance.', exampleVi: 'Thành công trong lập trình đòi hỏi sự kiên nhẫn và bền chí.', category: 'academic', level: 'C1' },
        { word: 'Break the ice', phonetic: '/breɪk ðiː aɪs/', pos: 'idiom', meaning: 'Phá vỡ không khí ngượng ngùng lúc bắt đầu cuộc trò chuyện', example: 'A small joke helped break the ice at the interview.', exampleVi: 'Một câu nói đùa nhỏ đã giúp phá tan sự ngượng ngùng khi phỏng vấn.', category: 'idiom', level: 'B1' }
      ]
    });
  } else if (type === 'course') {
    return res.json({
      success: true,
      data: [
        { title: 'Tiếng Anh Phỏng Vấn Tech & Trả Lời Behavioral Questions', titleEn: 'English for Tech Interviews & Behavioral Questions', category: 'it', level: 'Trung cấp (B1-B2)', instructor: 'Alex Tech Lead', youtubeUrl: 'https://www.youtube.com/watch?v=kJEsTjH5mVg', youtubeId: 'kJEsTjH5mVg', thumbnail: 'https://img.youtube.com/vi/kJEsTjH5mVg/hqdefault.jpg', description: 'Bí quyết trả lời các câu hỏi phỏng vấn hóc búa tại các công ty công nghệ đa quốc gia.', badge: 'Đề xuất', duration: '22:15' },
        { title: 'Luyện Nghe Phản Xạ Qua Tin Tức Công Nghệ AI Hàng Ngày', titleEn: 'AI & Tech News Listening Practice', category: 'listening', level: 'Trung cấp (B1-B2)', instructor: 'Emma TechEnglish', youtubeUrl: 'https://www.youtube.com/watch?v=juKd26qkNAw', youtubeId: 'juKd26qkNAw', thumbnail: 'https://img.youtube.com/vi/juKd26qkNAw/hqdefault.jpg', description: 'Cải thiện kỹ năng nghe phản xạ với các thuật ngữ công nghệ mới nhất.', badge: 'Hot', duration: '18:40' }
      ]
    });
  } else {
    return res.json({
      success: true,
      data: [
        { category: 'vocabulary', q: 'Từ nào sau đây có nghĩa là "Triển khai phần mềm lên máy chủ"?', options: ['Debug', 'Deploy', 'Compile', 'Refactor'], answer: 1 },
        { category: 'vocabulary', q: 'Thành ngữ "Break the ice" có nghĩa là gì?', options: ['Làm tan băng', 'Phá vỡ sự ngại ngùng ban đầu', 'Làm hỏng việc', 'Cố gắng hết sức'], answer: 1 },
        { category: 'grammar', q: 'Chọn dạng đúng: "By the time we arrived, the server _____ down."', options: ['has gone', 'had gone', 'was going', 'goes'], answer: 1 }
      ]
    });
  }
}

module.exports = {
  parseSheet,
  syncSheet,
  exportSheet,
  getSampleData
};
