const authController = require('../../../src/controllers/auth.controller');
const authService = require('../../../src/services/auth.service');
jest.mock('../../../src/services/auth.service');
describe('Auth Controller', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  it('should return token on successful login', () => {
    
    req.body = {
      email: 'admin@spsgroup.com.br',
      password: '1234'
    };
    
    authService.login.mockReturnValue({
      success: true,
      token: 'mocked-token'
    });
    
    authController.login(req, res);
    
    expect(authService.login).toHaveBeenCalledWith(req.body.email, req.body.password);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ token: 'mocked-token' });
  });
  it('should return 401 on failed login', () => {
    
    req.body = {
      email: 'admin@spsgroup.com.br',
      password: 'wrongpassword'
    };
    
    authService.login.mockReturnValue({
      success: false,
      message: 'Credenciais inválidas'
    });
    
    authController.login(req, res);
    
    expect(authService.login).toHaveBeenCalledWith(req.body.email, req.body.password);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciais inválidas' });
  });
}); 