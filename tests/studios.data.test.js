const {
  TECH_INTERVIEW_QUESTIONS,
  DICTATION_EXERCISES,
  SENTENCE_BUILDER_DATA,
  WORD_OF_THE_DAY_LIST
} = require('../js/data');

describe('Learning Studios Data Integrity Tests', () => {
  describe('Tech Interview Questions Data', () => {
    test('có đầy đủ các câu hỏi phỏng vấn và thuộc tính bắt buộc', () => {
      expect(Array.isArray(TECH_INTERVIEW_QUESTIONS)).toBe(true);
      expect(TECH_INTERVIEW_QUESTIONS.length).toBeGreaterThanOrEqual(4);

      TECH_INTERVIEW_QUESTIONS.forEach(q => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('category');
        expect(q).toHaveProperty('categoryLabel');
        expect(typeof q.question).toBe('string');
        expect(q.question.length).toBeGreaterThan(10);
        expect(typeof q.questionVi).toBe('string');
        expect(typeof q.hint).toBe('string');
        expect(typeof q.modelAnswer).toBe('string');
        expect(q.modelAnswer.length).toBeGreaterThan(20);
        expect(typeof q.modelAnswerVi).toBe('string');
        expect(Array.isArray(q.keyVocab)).toBe(true);
        expect(q.keyVocab.length).toBeGreaterThanOrEqual(1);

        q.keyVocab.forEach(kv => {
          expect(kv).toHaveProperty('word');
          expect(kv).toHaveProperty('meaning');
        });
      });
    });

    test('phân bố theo các chuyên mục kỹ thuật chính', () => {
      const categories = TECH_INTERVIEW_QUESTIONS.map(q => q.category);
      expect(categories).toContain('backend');
      expect(categories).toContain('system');
      expect(categories).toContain('agile');
    });
  });

  describe('Dictation Exercises Data', () => {
    test('có đầy đủ các bài tập nghe chép chính tả và format chuẩn', () => {
      expect(Array.isArray(DICTATION_EXERCISES)).toBe(true);
      expect(DICTATION_EXERCISES.length).toBeGreaterThanOrEqual(4);

      DICTATION_EXERCISES.forEach(ex => {
        expect(ex).toHaveProperty('id');
        expect(typeof ex.audioText).toBe('string');
        expect(ex.audioText.length).toBeGreaterThan(15);
        expect(typeof ex.textVi).toBe('string');
        expect(typeof ex.hint).toBe('string');
        expect(ex.hint).toContain('_');
        expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(ex.level);
        expect(typeof ex.category).toBe('string');
      });
    });
  });

  describe('Sentence Builder Puzzle Data', () => {
    test('có đầy đủ các câu đố xếp câu và trật tự từ vựng chính xác', () => {
      expect(Array.isArray(SENTENCE_BUILDER_DATA)).toBe(true);
      expect(SENTENCE_BUILDER_DATA.length).toBeGreaterThanOrEqual(4);

      SENTENCE_BUILDER_DATA.forEach(p => {
        expect(p).toHaveProperty('id');
        expect(typeof p.vietnamese).toBe('string');
        expect(typeof p.correctSentence).toBe('string');
        expect(Array.isArray(p.words)).toBe(true);
        expect(Array.isArray(p.distractors)).toBe(true);

        // Ghép các từ trong mảng words phải tạo nên correctSentence (bỏ qua dấu câu cuối)
        const reconstructed = p.words.join(' ').toLowerCase().replace(/[^a-z0-9]/g, '');
        const target = p.correctSentence.toLowerCase().replace(/[^a-z0-9]/g, '');
        expect(reconstructed).toBe(target);
      });
    });
  });

  describe('Word of the Day Spotlight Data', () => {
    test('có đầy đủ từ vựng tâm điểm kèm phát âm IPA và ngữ cảnh tech', () => {
      expect(Array.isArray(WORD_OF_THE_DAY_LIST)).toBe(true);
      expect(WORD_OF_THE_DAY_LIST.length).toBeGreaterThanOrEqual(3);

      WORD_OF_THE_DAY_LIST.forEach(w => {
        expect(typeof w.word).toBe('string');
        expect(w.phonetic).toMatch(/^\/.+\/$/);
        expect(typeof w.pos).toBe('string');
        expect(typeof w.meaning).toBe('string');
        expect(typeof w.example).toBe('string');
        expect(typeof w.exampleVi).toBe('string');
        expect(w.example.toLowerCase()).toContain(w.word.toLowerCase().slice(0, 4));
      });
    });
  });
});
