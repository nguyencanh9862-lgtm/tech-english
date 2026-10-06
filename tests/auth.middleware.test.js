const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../routes/authRoutes');
const User = require('../models/User');

describe('Authentication Middleware Unit Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('trả về 401 nếu không có header Authorization', async () => {
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Chưa đăng nhập'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('trả về 401 nếu header Authorization không chứa token', async () => {
    req.headers['authorization'] = 'Bearer';
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Chưa đăng nhập'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('trả về 403 nếu token không hợp lệ hoặc đã hết hạn', async () => {
    req.headers['authorization'] = 'Bearer invalid_token_123';
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('trả về 404 nếu token hợp lệ nhưng không tìm thấy user trong database', async () => {
    req.headers['authorization'] = 'Bearer valid_token';
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'user_123' });
    jest.spyOn(User, 'findById').mockResolvedValue(null);

    await authenticateToken(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user_123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Người dùng không tồn tại'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('gán req.user và gọi next() thành công khi token và user hợp lệ', async () => {
    const mockUser = {
      _id: 'user_123',
      name: 'Nguyen Van A',
      email: 'a@example.com',
      role: 'user'
    };

    req.headers['authorization'] = 'Bearer valid_token';
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'user_123' });
    jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

    await authenticateToken(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user_123');
    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
