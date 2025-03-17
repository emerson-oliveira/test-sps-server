const userRepository = require('../../../src/repository/users.repository');
describe('User Repository', () => {
  
  let adminUser;
  beforeEach(() => {
    
    adminUser = userRepository.findByEmail('admin@spsgroup.com.br');
    
    const allUsers = userRepository.getAll();
    allUsers.forEach((user) => {
      if (user.email !== 'admin@spsgroup.com.br') {
        userRepository.remove(user.id);
      }
    });
  });
  it('should have admin user pre-registered', () => {
    const admin = userRepository.findByEmail('admin@spsgroup.com.br');
    expect(admin).toBeDefined();
    expect(admin.name).toBe('admin');
    expect(admin.type).toBe('admin');
    expect(admin.password).toBe('1234');
  });
  it('should add a new user', () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      type: 'user',
      password: 'password123',
    };
    userRepository.add(user);
    const foundUser = userRepository.findByEmail('test@example.com');
    
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBeDefined();
    expect(foundUser.name).toBe('Test User');
    expect(foundUser.email).toBe('test@example.com');
    expect(foundUser.type).toBe('user');
    expect(foundUser.password).toBe('password123');
  });
  it('should find a user by email', () => {
    const user = {
      name: 'Find User',
      email: 'find@example.com',
      type: 'user',
      password: 'findpassword',
    };
    userRepository.add(user);
    const foundUser = userRepository.findByEmail('find@example.com');
    
    expect(foundUser).toBeDefined();
    expect(foundUser.name).toBe('Find User');
  });
  it('should find a user by id', () => {
    const user = {
      name: 'ID User',
      email: 'id@example.com',
      type: 'user',
      password: 'idpassword',
    };
    userRepository.add(user);
    const allUsers = userRepository.getAll();
    const addedUser = allUsers.find(u => u.email === 'id@example.com');
    const foundUser = userRepository.findById(addedUser.id);
    
    expect(foundUser).toBeDefined();
    expect(foundUser.name).toBe('ID User');
  });
  it('should update a user', () => {
    const user = {
      name: 'Update User',
      email: 'update@example.com',
      type: 'user',
      password: 'updatepassword',
    };
    userRepository.add(user);
    const allUsers = userRepository.getAll();
    const addedUser = allUsers.find(u => u.email === 'update@example.com');
    
    const updatedUser = {
      name: 'Updated Name',
      type: 'admin',
    };
    
    userRepository.update(addedUser.id, updatedUser);
    const foundUser = userRepository.findById(addedUser.id);
    
    expect(foundUser.name).toBe('Updated Name');
    expect(foundUser.type).toBe('admin');
    expect(foundUser.email).toBe('update@example.com');
    expect(foundUser.password).toBe('updatepassword');
  });
  it('should remove a user', () => {
    const user = {
      name: 'Remove User',
      email: 'remove@example.com',
      type: 'user',
      password: 'removepassword',
    };
    userRepository.add(user);
    const allUsers = userRepository.getAll();
    const addedUser = allUsers.find(u => u.email === 'remove@example.com');
    
    userRepository.remove(addedUser.id);
    const foundUser = userRepository.findById(addedUser.id);
    
    expect(foundUser).toBeUndefined();
  });
  it('should get all users', () => {
    
    const user1 = {
      name: 'User One',
      email: 'user1@example.com',
      type: 'user',
      password: 'password1',
    };
    const user2 = {
      name: 'User Two',
      email: 'user2@example.com',
      type: 'user',
      password: 'password2',
    };
    userRepository.add(user1);
    userRepository.add(user2);
    const allUsers = userRepository.getAll();
    
    expect(allUsers.length).toBe(3); 
    expect(allUsers.some(u => u.email === 'admin@spsgroup.com.br')).toBeTruthy();
    expect(allUsers.some(u => u.email === 'user1@example.com')).toBeTruthy();
    expect(allUsers.some(u => u.email === 'user2@example.com')).toBeTruthy();
  });
}); 