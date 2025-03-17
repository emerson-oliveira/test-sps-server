const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../../src/middleware/auth');
process.env.SECRET_KEY = 'your-secret-key';
describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });
  it('should return 401 if no authorization header is provided', () => {
    
    verifyToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });
  it('should return 401 if authorization header does not contain token', () => {
    
    req.headers['authorization'] = 'Bearer ';
    
    verifyToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });
  it('should return 401 if token is invalid', () => {
    
    req.headers['authorization'] = 'Bearer invalid-token';
    
    
    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });
    
    verifyToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });
  it('should call next() if token is valid', () => {
    
    req.headers['authorization'] = 'Bearer valid-token';
    
    const decodedUser = {
      email: 'test@example.com',
      type: 'admin',
      name: 'Test User',
    };
    
    
    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback(null, decodedUser);
    });
    
    verifyToken(req, res, next);
    
    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
}); 