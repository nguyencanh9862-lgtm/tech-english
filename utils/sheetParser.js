/**
 * Trích xuất Sheet ID và GID từ đường dẫn Google Sheets
 * @param {string} url - Link Google Sheets hoặc Sheet ID
 * @returns {{ sheetId: string, gid: string } | null}
 */
function parseGoogleSheetUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If user pasted raw ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return { sheetId: trimmed, gid: '0' };
  }

  // Extract /d/{id}/
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;

  const sheetId = idMatch[1];
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  return { sheetId, gid };
}

/**
 * Phân tích chuỗi CSV an toàn sang mảng 2 chiều (2D Array)
 * @param {string} csvText - Nội dung chuỗi CSV
 * @returns {Array<Array<string>>}
 */
function parseCsv(csvText) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // ignore CR
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Push last cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Chuẩn hóa tên tiêu đề cột (bỏ dấu tiếng Việt, chữ thường, không khoảng trắng)
 * @param {string} h - Tên tiêu đề gốc
 * @returns {string}
 */
function cleanHeader(h) {
  if (!h) return '';
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Chuyển đổi hàng dữ liệu từ vựng theo map tiêu đề
 * @param {Array<string>} row - Hàng dữ liệu
 * @param {Object} headerMap - Ánh xạ vị trí cột
 * @returns {Object|null}
 */
function mapVocabRow(row, headerMap) {
  const get = (key) => (headerMap[key] !== undefined && row[headerMap[key]] !== undefined ? row[headerMap[key]] : '');

  const word = get('word') || get('tuvung') || get('tu') || '';
  const phonetic = get('phonetic') || get('phienam') || get('ipa') || '';
  const meaning = get('meaning') || get('nghia') || get('dichnghia') || get('giaithich') || '';
  const pos = get('pos') || get('loaitu') || 'n';
  const example = get('example') || get('vidu') || get('caumau') || '';
  const exampleVi = get('examplevi') || get('dichvidu') || get('vidutiengviet') || '';
  const category = get('category') || get('chude') || get('danhmuc') || 'daily';
  const level = get('level') || get('capdo') || get('trinhdo') || 'A2';

  if (!word || !meaning) return null;

  return {
    word: word.trim(),
    phonetic: phonetic.trim(),
    pos: pos.trim().toLowerCase(),
    meaning: meaning.trim(),
    example: example.trim(),
    exampleVi: exampleVi.trim(),
    category: category.trim().toLowerCase(),
    level: level.trim().toUpperCase()
  };
}

/**
 * Chuyển đổi hàng dữ liệu khóa học theo map tiêu đề
 * @param {Array<string>} row - Hàng dữ liệu
 * @param {Object} headerMap - Ánh xạ vị trí cột
 * @returns {Object|null}
 */
function mapCourseRow(row, headerMap) {
  const get = (key) => (headerMap[key] !== undefined && row[headerMap[key]] !== undefined ? row[headerMap[key]] : '');

  const title = get('title') || get('tenkhoahoc') || get('tieude') || '';
  const titleEn = get('titleen') || get('tientienganh') || '';
  const category = get('category') || get('chude') || get('chuyenmuc') || 'communication';
  const level = get('level') || get('capdo') || get('trinhdo') || 'Cơ bản (A1-A2)';
  const description = get('description') || get('mota') || get('noidung') || '';
  const instructor = get('instructor') || get('giangvien') || get('kenh') || 'TechEnglish Coach';
  const youtubeUrl = get('youtubeurl') || get('linkyoutube') || get('video') || get('youtube') || '';
  const badge = get('badge') || get('nhan') || 'Từ Google Sheet';
  const duration = get('duration') || get('thoiluong') || '15:00';

  if (!title) return null;

  // Extract YouTube ID
  let youtubeId = '';
  if (youtubeUrl) {
    const m = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (m) youtubeId = m[1];
  }

  const thumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

  return {
    title: title.trim(),
    titleEn: titleEn.trim(),
    category: category.trim().toLowerCase(),
    level: level.trim(),
    description: description.trim() || 'Khóa học được nhập từ Google Sheets.',
    instructor: instructor.trim(),
    youtubeUrl: youtubeUrl.trim(),
    youtubeId,
    thumbnail,
    badge: badge.trim(),
    duration: duration.trim()
  };
}

/**
 * Chuyển đổi hàng dữ liệu trắc nghiệm theo map tiêu đề
 * @param {Array<string>} row - Hàng dữ liệu
 * @param {Object} headerMap - Ánh xạ vị trí cột
 * @returns {Object|null}
 */
function mapQuizRow(row, headerMap) {
  const get = (key) => (headerMap[key] !== undefined && row[headerMap[key]] !== undefined ? row[headerMap[key]] : '');

  const q = get('q') || get('cauhoi') || get('question') || '';
  const optA = get('opta') || get('dapana') || get('a') || '';
  const optB = get('optb') || get('dapanb') || get('b') || '';
  const optC = get('optc') || get('dapanc') || get('c') || '';
  const optD = get('optd') || get('dapand') || get('d') || '';
  const rawAns = get('answer') || get('dapandung') || get('ans') || '0';
  const category = get('category') || get('chude') || 'vocabulary';

  if (!q || !optA || !optB) return null;

  const options = [optA, optB];
  if (optC) options.push(optC);
  if (optD) options.push(optD);

  let answerIndex = 0;
  const ansStr = String(rawAns).trim().toUpperCase();
  if (ansStr === 'A' || ansStr === '1') answerIndex = 0;
  else if (ansStr === 'B' || ansStr === '2') answerIndex = 1;
  else if (ansStr === 'C' || ansStr === '3') answerIndex = 2;
  else if (ansStr === 'D' || ansStr === '4') answerIndex = 3;
  else {
    const num = parseInt(ansStr, 10);
    if (!isNaN(num) && num >= 0 && num < options.length) answerIndex = num;
  }

  return {
    category: ['vocabulary', 'grammar', 'listening', 'mixed'].includes(category.toLowerCase()) ? category.toLowerCase() : 'vocabulary',
    q: q.trim(),
    options,
    answer: answerIndex
  };
}

module.exports = {
  parseGoogleSheetUrl,
  parseCsv,
  cleanHeader,
  mapVocabRow,
  mapCourseRow,
  mapQuizRow
};
