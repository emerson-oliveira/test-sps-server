const request = require('supertest');
const app = require('../../src/app');
const userRepository = require('../../src/repository/users.repository');
describe('API End-to-End Tests', () => {
  let adminToken;
  let testUserId;
  
  beforeAll(async () => {
    
    const allUsers = userRepository.getAll();
    allUsers.forEach((user) => {
      if (user.email !== 'admin@spsgroup.com.br') {
        userRepository.remove(user.id);
      }
    });
    
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@spsgroup.com.br',
        password: '1234',
      });
    adminToken = loginResponse.body.token;
    expect(adminToken).toBeDefined();
  });
  
  describe('Fluxo Completo de Usuários', () => {
    it('Deve criar um novo usuário', async () => {
      const newUser = {
        name: 'E2E Test User',
        email: 'e2e-test@example.com',
        type: 'user',
        password: 'e2epassword',
      };
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body.type).toBe(newUser.type);
      
      testUserId = response.body.id;
    });
    it('Deve retornar todos os usuários', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      
      const testUser = response.body.find(user => user.id === testUserId);
      expect(testUser).toBeDefined();
      expect(testUser.email).toBe('e2e-test@example.com');
    });
    it('Deve obter um usuário específico pelo ID', async () => {
      const response = await request(app)
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body.email).toBe('e2e-test@example.com');
    });
    it('Deve atualizar um usuário', async () => {
      const updatedData = {
        name: 'Updated E2E User',
        type: 'admin',
      };
      const response = await request(app)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.type).toBe(updatedData.type);
      expect(response.body.email).toBe('e2e-test@example.com'); 
    });
    it('Deve remover um usuário', async () => {
      const response = await request(app)
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Usuário removido com sucesso');
      
      const userResponse = await request(app)
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(userResponse.status).toBe(404);
    });
  });
  
  describe('Validações e Casos de Erro', () => {
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
  
  describe('Autenticação', () => {
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
          email: 'admin@spsgroup.com.br',
          password: 'wrongpassword',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });
    it('Deve autenticar com credenciais válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@spsgroup.com.br',
          password: '1234',
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
  
  describe('Ciclo de Vida Completo de Usuário', () => {
    let userId;
    let userToken;
    it('Deve criar um novo usuário para teste de ciclo de vida', async () => {
      const newUser = {
        name: 'Lifecycle User',
        email: 'lifecycle@example.com',
        type: 'user',
        password: 'lifecycle123',
      };
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);
      expect(response.status).toBe(201);
      userId = response.body.id;
    });
    it('Deve permitir que o novo usuário faça login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'lifecycle@example.com',
          password: 'lifecycle123',
        });
      expect(response.status).toBe(200);
      userToken = response.body.token;
    });
    it('Deve permitir que o usuário acesse recursos com seu próprio token', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    it('Deve permitir que o admin atualize o tipo do usuário', async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'admin',
        });
      expect(response.status).toBe(200);
      expect(response.body.type).toBe('admin');
    });
    it('Deve permitir que o admin remova o usuário', async () => {
      const response = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
    });
  });
}); 