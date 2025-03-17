const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../src/app');
const userRepository = require('../../../src/repository/users.repository');
process.env.SECRET_KEY = 'your-secret-key';
describe('Auth Routes', () => {
  describe('POST /auth/login', () => {
    
    afterEach(() => {
      if (jwt.sign.mockRestore) {
        jwt.sign.mockRestore();
      }
    });
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
    it('should return 401 for valid email but invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br',
          password: 'wrongpassword',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
    it('should return token for valid credentials', async () => {
      
      jest.spyOn(jwt, 'sign').mockReturnValue('mocked-token');
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br',
          password: '1234',
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mocked-token');
      
      
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          email: 'admin@spsgroup.com.br',
          type: 'admin',
          name: 'admin',
        },
        process.env.SECRET_KEY,
        expect.objectContaining({
          expiresIn: '1h',
        })
      );
    });
  });
}); 