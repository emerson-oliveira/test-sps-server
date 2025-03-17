const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../src/app');
const userRepository = require('../../../src/repository/users.repository');
process.env.SECRET_KEY = 'your-secret-key';
describe('User Routes', () => {
  
  let validToken;
  let adminUser;
  let testUsers = [];
  beforeAll(() => {
    adminUser = userRepository.findByEmail('admin@spsgroup.com.br');
    
    validToken = jwt.sign(
      { email: adminUser.email, type: adminUser.type, name: adminUser.name },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );
  });
  beforeEach(() => {
    
    const allUsers = userRepository.getAll();
    allUsers.forEach((user) => {
      if (user.email !== 'admin@spsgroup.com.br') {
        userRepository.remove(user.id);
      }
    });
    testUsers = [];
    
    const testUser1 = {
      name: 'Test User 1',
      email: 'test1@example.com',
      type: 'user',
      password: 'password1',
    };
    
    const testUser2 = {
      name: 'Test User 2',
      email: 'test2@example.com',
      type: 'admin',
      password: 'password2',
    };
    userRepository.add(testUser1);
    userRepository.add(testUser2);
    
    const updatedUsers = userRepository.getAll();
    testUsers = updatedUsers.filter(
      (user) => user.email === 'test1@example.com' || user.email === 'test2@example.com'
    );
  });
  describe('Authorization', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/users');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token não fornecido');
    });
    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token inválido');
    });
  });
  describe('GET /users', () => {
    it('should return all users when authenticated', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      
      
      const emails = response.body.map(user => user.email);
      expect(emails).toContain('admin@spsgroup.com.br');
      expect(emails).toContain('test1@example.com');
      expect(emails).toContain('test2@example.com');
    });
  });
  describe('GET /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
    it('should return the correct user when authenticated', async () => {
      const testUser = testUsers[0];
      
      const response = await request(app)
        .get(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('name', testUser.name);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('type', testUser.type);
    });
  });
  describe('POST /users', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Incomplete User',
          
          type: 'user',
          password: 'password',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Campos obrigatórios não informados');
    });
    it('should return 400 if email already exists', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Duplicate Email',
          email: 'test1@example.com', 
          type: 'user',
          password: 'password',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email já cadastrado');
    });
    it('should create a new user when authenticated', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        type: 'user',
        password: 'newpassword',
      };
      
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newUser.name);
      expect(response.body).toHaveProperty('email', newUser.email);
      expect(response.body).toHaveProperty('type', newUser.type);
      
      
      const addedUser = userRepository.findByEmail(newUser.email);
      expect(addedUser).toBeDefined();
      expect(addedUser.name).toBe(newUser.name);
    });
  });
  describe('PUT /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/users/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Updated Name',
        });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
    it('should return 400 if email already exists', async () => {
      
      if (testUsers.length < 2) {
        throw new Error('Teste requer pelo menos dois usuários de teste');
      }
      
      const testUser1 = testUsers[0]; 
      const testUser2 = testUsers[1]; 
      
      const response = await request(app)
        .put(`/users/${testUser1.id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          email: testUser2.email, 
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email já cadastrado');
    });
    it('should update a user when authenticated', async () => {
      const testUser = testUsers[0];
      const updates = {
        name: 'Updated Name',
        type: 'admin',
      };
      
      const response = await request(app)
        .put(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('name', updates.name);
      expect(response.body).toHaveProperty('type', updates.type);
      expect(response.body).toHaveProperty('email', testUser.email);
      
      
      const updatedUser = userRepository.findById(testUser.id);
      expect(updatedUser.name).toBe(updates.name);
      expect(updatedUser.type).toBe(updates.type);
    });
  });
  describe('DELETE /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/users/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuário não encontrado');
    });
    it('should delete a user when authenticated', async () => {
      const testUser = testUsers[0];
      
      const response = await request(app)
        .delete(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Usuário removido com sucesso');
      
      
      const deletedUser = userRepository.findById(testUser.id);
      expect(deletedUser).toBeUndefined();
    });
  });
}); 