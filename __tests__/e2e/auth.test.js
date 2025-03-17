const request = require('supertest');
const app = require('../../src/app');
const userRepository = require('../../src/repository/users.repository');
describe('Autenticação - End-to-End Tests', () => {
  let adminCredentials;
  beforeAll(() => {
    adminCredentials = {
      email: 'admin@spsgroup.com.br',
      password: '1234'
    };
  });
  describe('Login', () => {
    it('Deve rejeitar login com email inexistente', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
    it('Deve rejeitar login com senha incorreta', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: adminCredentials.email,
          password: 'wrongpassword',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
    it('Deve autenticar com credenciais válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(adminCredentials);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
  describe('Autorização', () => {
    it('Deve rejeitar acesso sem token de autenticação', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token não fornecido');
    });
    it('Deve rejeitar acesso com token inválido', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token inválido');
    });
  });
}); 