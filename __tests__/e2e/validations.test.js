const request = require('supertest');
const app = require('../../src/app');
const userRepository = require('../../src/repository/users.repository');
describe('Validações e Casos de Erro - End-to-End Tests', () => {
  let adminToken;
  
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@spsgroup.com.br',
        password: '1234',
      });
    adminToken = loginResponse.body.token;
    expect(adminToken).toBeDefined();
  });
  describe('Validações de Criação de Usuário', () => {
    it('Deve rejeitar criação de usuário com email existente', async () => {
      
      const user = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        type: 'user',
        password: 'password123',
      };
      await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);
      
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email já cadastrado');
    });
    it('Deve rejeitar criação de usuário com campos obrigatórios faltando', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete User',
          
          type: 'user',
          password: 'password',
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Campos obrigatórios não informados');
    });
  });
  describe('Validações de Atualização de Usuário', () => {
    let testUserId;
    beforeAll(async () => {
      
      const user = {
        name: 'Update Test User',
        email: 'update-test@example.com',
        type: 'user',
        password: 'password'
      };
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(user);
      
      testUserId = response.body.id;
    });
    it('Deve rejeitar atualização para email já existente', async () => {
      
      const anotherUser = {
        name: 'Another User',
        email: 'another@example.com',
        type: 'user',
        password: 'password123',
      };
      await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(anotherUser);
      
      const response = await request(app)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'another@example.com'
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email já cadastrado');
    });
    it('Deve rejeitar atualização de usuário inexistente', async () => {
      const nonExistentUserId = 'non-existent-id';
      
      const response = await request(app)
        .put(`/users/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name'
        });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });
  describe('Validações de Remoção de Usuário', () => {
    it('Deve rejeitar remoção de usuário inexistente', async () => {
      const nonExistentUserId = 'non-existent-id';
      
      const response = await request(app)
        .delete(`/users/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });
  describe('Validações de Busca de Usuário', () => {
    it('Deve rejeitar busca de usuário inexistente', async () => {
      const nonExistentUserId = 'non-existent-id';
      
      const response = await request(app)
        .get(`/users/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });
}); 