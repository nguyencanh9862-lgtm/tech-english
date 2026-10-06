const request = require('supertest');
const app = require('../server');
const Vocabulary = require('../models/Vocabulary');

describe('Vocabulary Routes Unit Tests (/api/vocab)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/vocab', () => {
    test('lọc từ vựng theo category, level và từ khóa search', async () => {
      const mockList = [
        { id: 1, word: 'Algorithm', meaning: 'Thuật toán', category: 'it', level: 'B1' }
      ];

      const findSpy = jest.spyOn(Vocabulary, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockList)
      });

      const res = await request(app).get('/api/vocab?category=it&level=B1&search=algo');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(findSpy).toHaveBeenCalledWith(expect.objectContaining({
        category: 'it',
        level: 'B1',
        $or: expect.any(Array)
      }));
    });
  });

  describe('GET /api/vocab/:id', () => {
    test('trả về chi tiết từ vựng theo id', async () => {
      const mockItem = { id: 1, word: 'Algorithm', meaning: 'Thuật toán' };
      jest.spyOn(Vocabulary, 'findOne').mockResolvedValue(mockItem);

      const res = await request(app).get('/api/vocab/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.word).toBe('Algorithm');
    });

    test('báo lỗi 404 nếu không tìm thấy từ vựng', async () => {
      jest.spyOn(Vocabulary, 'findOne').mockResolvedValue(null);

      const res = await request(app).get('/api/vocab/999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Không tìm thấy từ vựng');
    });
  });

  describe('POST /api/vocab', () => {
    test('thêm từ vựng mới thành công', async () => {
      jest.spyOn(Vocabulary, 'findOne').mockReturnValue({
        sort: jest.fn().mockResolvedValue({ id: 10 })
      });
      jest.spyOn(Vocabulary.prototype, 'save').mockResolvedValue(this);

      const res = await request(app)
        .post('/api/vocab')
        .send({
          word: 'Inheritance',
          meaning: 'Tính kế thừa trong OOP',
          category: 'it',
          level: 'B2'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Thêm từ vựng thành công');
      expect(res.body.data.word).toBe('Inheritance');
    });
  });

  describe('PUT /api/vocab/:id', () => {
    test('cập nhật từ vựng thành công', async () => {
      const updatedItem = { id: 1, word: 'Updated Word', meaning: 'Nghĩa mới' };
      jest.spyOn(Vocabulary, 'findOneAndUpdate').mockResolvedValue(updatedItem);

      const res = await request(app)
        .put('/api/vocab/1')
        .send({ word: 'Updated Word', meaning: 'Nghĩa mới' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.word).toBe('Updated Word');
    });

    test('báo lỗi 404 khi cập nhật từ không tồn tại', async () => {
      jest.spyOn(Vocabulary, 'findOneAndUpdate').mockResolvedValue(null);

      const res = await request(app)
        .put('/api/vocab/999')
        .send({ word: 'Not Found' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/vocab/:id', () => {
    test('xóa từ vựng thành công', async () => {
      const deletedItem = { id: 1, word: 'Deleted Word' };
      jest.spyOn(Vocabulary, 'findOneAndDelete').mockResolvedValue(deletedItem);

      const res = await request(app).delete('/api/vocab/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Đã xóa từ vựng');
    });

    test('báo lỗi 404 khi xóa từ vựng không tồn tại', async () => {
      jest.spyOn(Vocabulary, 'findOneAndDelete').mockResolvedValue(null);

      const res = await request(app).delete('/api/vocab/999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
