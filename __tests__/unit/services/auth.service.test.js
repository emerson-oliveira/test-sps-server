const jwt = require('jsonwebtoken');
const authService = require('../../../src/services/auth.service');
const userRepository = require('../../../src/repository/users.repository');
jest.mock('jsonwebtoken');
process.env.SECRET_KEY = 'your-secret-key';
describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return success and token for valid credentials', () => {
    
    const mockUser = {
      email: 'admin@spsgroup.com.br',
      name: 'admin',
      type: 'admin',
      password: '1234'
    };
    
    jest.spyOn(userRepository, 'findByEmail').mockReturnValue(mockUser);
    
    jwt.sign.mockReturnValue('mocked-token');
    
    const result = authService.login('admin@spsgroup.com.br', '1234');
    
    expect(result.success).toBe(true);
    expect(result.token).toBe('mocked-token');
    expect(userRepository.findByEmail).toHaveBeenCalledWith('admin@spsgroup.com.br');
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: mockUser.email, type: mockUser.type, name: mockUser.name },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );
  });
  it('should return failure for non-existent email', () => {
    
    jest.spyOn(userRepository, 'findByEmail').mockReturnValue(undefined);
    
    const result = authService.login('nonexistent@example.com', 'anypassword');
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Credenciais inválidas');
    expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    expect(jwt.sign).not.toHaveBeenCalled();
  });
  it('should return failure for invalid password', () => {
    
    const mockUser = {
      email: 'admin@spsgroup.com.br',
      name: 'admin',
      type: 'admin',
      password: '1234'
    };
    
    jest.spyOn(userRepository, 'findByEmail').mockReturnValue(mockUser);
    
    const result = authService.login('admin@spsgroup.com.br', 'wrongpassword');
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Credenciais inválidas');
    expect(userRepository.findByEmail).toHaveBeenCalledWith('admin@spsgroup.com.br');
    expect(jwt.sign).not.toHaveBeenCalled();
  });
}); 