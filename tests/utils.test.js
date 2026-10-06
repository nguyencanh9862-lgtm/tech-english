const { extractYouTubeId } = require('../routes/courseRoutes');
const {
  parseGoogleSheetUrl,
  parseCsv,
  cleanHeader,
  mapVocabRow,
  mapCourseRow,
  mapQuizRow
} = require('../routes/sheetRoutes');
const { fileFilter } = require('../routes/uploadRoutes');

describe('Utility Functions Unit Tests', () => {
  describe('extractYouTubeId', () => {
    test('trích xuất ID từ link YouTube tiêu chuẩn (watch?v=)', () => {
      const url = 'https://www.youtube.com/watch?v=kJEsTjH5mVg';
      expect(extractYouTubeId(url)).toBe('kJEsTjH5mVg');
    });

    test('trích xuất ID từ link có thêm tham số URL', () => {
      const url = 'https://www.youtube.com/watch?v=kJEsTjH5mVg&feature=share&t=45s';
      expect(extractYouTubeId(url)).toBe('kJEsTjH5mVg');
    });

    test('trích xuất ID từ link rút gọn youtu.be', () => {
      const url = 'https://youtu.be/juKd26qkNAw';
      expect(extractYouTubeId(url)).toBe('juKd26qkNAw');
    });

    test('trích xuất ID từ link YouTube Embed', () => {
      const url = 'https://www.youtube.com/embed/kJEsTjH5mVg';
      expect(extractYouTubeId(url)).toBe('kJEsTjH5mVg');
    });

    test('trích xuất ID từ link YouTube Shorts', () => {
      const url = 'https://www.youtube.com/shorts/juKd26qkNAw';
      expect(extractYouTubeId(url)).toBe('juKd26qkNAw');
    });

    test('giữ nguyên chuỗi nếu người dùng nhập trực tiếp ID 11 ký tự', () => {
      const id = 'kJEsTjH5mVg';
      expect(extractYouTubeId(id)).toBe('kJEsTjH5mVg');
    });

    test('trả về chuỗi rỗng đối với URL không hợp lệ hoặc dữ liệu trống', () => {
      expect(extractYouTubeId('')).toBe('');
      expect(extractYouTubeId(null)).toBe('');
      expect(extractYouTubeId(undefined)).toBe('');
      expect(extractYouTubeId('https://google.com/test')).toBe('');
    });
  });

  describe('parseGoogleSheetUrl', () => {
    test('phân tích link Google Sheet tiêu chuẩn đầy đủ ID và gid', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=987654';
      const result = parseGoogleSheetUrl(url);
      expect(result).toEqual({
        sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        gid: '987654'
      });
    });

    test('phân tích link Google Sheet không có gid (mặc định gid=0)', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
      const result = parseGoogleSheetUrl(url);
      expect(result).toEqual({
        sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        gid: '0'
      });
    });

    test('nhận diện Sheet ID thô (chuỗi dài >= 20 ký tự)', () => {
      const rawId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
      const result = parseGoogleSheetUrl(rawId);
      expect(result).toEqual({
        sheetId: rawId,
        gid: '0'
      });
    });

    test('trả về null nếu link không hợp lệ hoặc rỗng', () => {
      expect(parseGoogleSheetUrl('')).toBeNull();
      expect(parseGoogleSheetUrl(null)).toBeNull();
      expect(parseGoogleSheetUrl('https://otherwebsite.com/data')).toBeNull();
    });
  });

  describe('parseCsv', () => {
    test('phân tích CSV cơ bản không có dấu ngoặc kép', () => {
      const csv = 'word,meaning,level\nhello,xin chao,A1\nworld,the gioi,A1';
      const rows = parseCsv(csv);
      expect(rows).toEqual([
        ['word', 'meaning', 'level'],
        ['hello', 'xin chao', 'A1'],
        ['world', 'the gioi', 'A1']
      ]);
    });

    test('phân tích ô chứa dấu phẩy bên trong dấu ngoặc kép', () => {
      const csv = 'word,meaning\n"Algorithm, Data Structure","Thuat toan, Cau truc du lieu"';
      const rows = parseCsv(csv);
      expect(rows.length).toBe(2);
      expect(rows[1][0]).toBe('Algorithm, Data Structure');
      expect(rows[1][1]).toBe('Thuat toan, Cau truc du lieu');
    });

    test('xử lý ký tự ngoặc kép thoát ("")', () => {
      const csv = 'id,quote\n1,"He said ""Hello"" to me"';
      const rows = parseCsv(csv);
      expect(rows[1][1]).toBe('He said "Hello" to me');
    });

    test('bỏ qua hàng trống và xử lý ký tự xuống dòng Windows (CRLF)', () => {
      const csv = "a,b\r\n1,2\r\n\r\n3,4\r\n";
      const rows = parseCsv(csv);
      expect(rows).toEqual([
        ['a', 'b'],
        ['1', '2'],
        ['3', '4']
      ]);
    });
  });

  describe('cleanHeader', () => {
    test('loại bỏ dấu tiếng Việt và chuẩn hóa chữ thường không khoảng trắng', () => {
      expect(cleanHeader('Từ vựng')).toBe('tuvung');
      expect(cleanHeader('Phiên âm')).toBe('phienam');
      expect(cleanHeader('Giải thích / Nghĩa')).toBe('giaithichnghia');
      expect(cleanHeader('Tên Khóa Học')).toBe('tenkhoahoc');
    });

    test('xử lý chuỗi rỗng hoặc undefined', () => {
      expect(cleanHeader('')).toBe('');
      expect(cleanHeader(null)).toBe('');
      expect(cleanHeader(undefined)).toBe('');
    });
  });

  describe('mapVocabRow', () => {
    const headerMap = {
      word: 0,
      phonetic: 1,
      pos: 2,
      meaning: 3,
      example: 4,
      examplevi: 5,
      category: 6,
      level: 7
    };

    test('map thành công hàng từ vựng hợp lệ', () => {
      const row = ['Deploy', '/dɪˈplɔɪ/', 'v', 'Triển khai phần mềm', 'Deploy to prod', 'Triển khai lên máy chủ', 'it', 'B2'];
      const mapped = mapVocabRow(row, headerMap);

      expect(mapped).toEqual({
        word: 'Deploy',
        phonetic: '/dɪˈplɔɪ/',
        pos: 'v',
        meaning: 'Triển khai phần mềm',
        example: 'Deploy to prod',
        exampleVi: 'Triển khai lên máy chủ',
        category: 'it',
        level: 'B2'
      });
    });

    test('trả về null nếu thiếu word hoặc meaning', () => {
      const rowNoWord = ['', '/test/', 'n', 'nghĩa', '', '', 'daily', 'A1'];
      const rowNoMeaning = ['Word', '/test/', 'n', '', '', '', 'daily', 'A1'];
      expect(mapVocabRow(rowNoWord, headerMap)).toBeNull();
      expect(mapVocabRow(rowNoMeaning, headerMap)).toBeNull();
    });

    test('áp dụng giá trị mặc định cho pos (n), category (daily), level (A2)', () => {
      const sparseHeaderMap = { tuvung: 0, nghia: 1 };
      const row = ['Sprint', 'Giai đoạn nước rút trong Agile'];
      const mapped = mapVocabRow(row, sparseHeaderMap);

      expect(mapped.pos).toBe('n');
      expect(mapped.category).toBe('daily');
      expect(mapped.level).toBe('A2');
    });
  });

  describe('mapCourseRow', () => {
    test('map thành công hàng khóa học có YouTube URL và trích xuất thumbnail', () => {
      const headerMap = { title: 0, youtubeurl: 1, category: 2, level: 3, instructor: 4 };
      const row = ['ReactJS Cơ bản', 'https://www.youtube.com/watch?v=kJEsTjH5mVg', 'it', 'Cơ bản', 'Admin'];
      const mapped = mapCourseRow(row, headerMap);

      expect(mapped.title).toBe('ReactJS Cơ bản');
      expect(mapped.youtubeId).toBe('kJEsTjH5mVg');
      expect(mapped.thumbnail).toContain('kJEsTjH5mVg');
      expect(mapped.category).toBe('it');
    });

    test('trả về null nếu không có title', () => {
      const headerMap = { title: 0 };
      expect(mapCourseRow([''], headerMap)).toBeNull();
    });
  });

  describe('mapQuizRow', () => {
    test('map thành công câu hỏi trắc nghiệm với đáp án dạng chữ cái A, B, C, D', () => {
      const headerMap = { q: 0, opta: 1, optb: 2, optc: 3, optd: 4, answer: 5, category: 6 };
      const row = ['1 + 1 = ?', '1', '2', '3', '4', 'B', 'mixed'];
      const mapped = mapQuizRow(row, headerMap);

      expect(mapped.q).toBe('1 + 1 = ?');
      expect(mapped.options).toEqual(['1', '2', '3', '4']);
      expect(mapped.answer).toBe(1); // 'B' tương ứng với index 1
      expect(mapped.category).toBe('mixed');
    });

    test('trả về null nếu câu hỏi thiếu nội dung hoặc có ít hơn 2 lựa chọn', () => {
      const headerMap = { q: 0, opta: 1 };
      const row = ['Câu hỏi đơn?', 'Lựa chọn A'];
      expect(mapQuizRow(row, headerMap)).toBeNull();
    });
  });

  describe('fileFilter (uploadRoutes)', () => {
    test('chấp nhận các định dạng ảnh hợp lệ (jpg, png, gif, webp, svg)', (done) => {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      let count = 0;

      allowed.forEach(mimetype => {
        fileFilter({}, { mimetype }, (err, accepted) => {
          expect(err).toBeNull();
          expect(accepted).toBe(true);
          count++;
          if (count === allowed.length) done();
        });
      });
    });

    test('từ chối các file không phải là hình ảnh (pdf, exe, txt)', (done) => {
      fileFilter({}, { mimetype: 'application/pdf' }, (err, accepted) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('Chỉ chấp nhận file hình ảnh');
        expect(accepted).toBe(false);
        done();
      });
    });
  });
});
