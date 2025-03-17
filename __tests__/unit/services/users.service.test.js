const userService = require('../../../src/services/users.service');
const userRepository = require('../../../src/repository/users.repository');
jest.mock('../../../src/repository/users.repository');
describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getAllUsers', () => {
    it('should return all users from repository', () => {
      
      const mockUsers = [{ id: '1', name: 'User 1' }, { id: '2', name: 'User 2' }];
      userRepository.getAll.mockReturnValue(mockUsers);
      
      const result = userService.getAllUsers();
      
      expect(result).toEqual(mockUsers);
      expect(userRepository.getAll).toHaveBeenCalled();
    });
  });
  describe('getUserById', () => {
    it('should return success and user when user exists', () => {
      
      const mockUser = { id: '1', name: 'User 1' };
      userRepository.findById.mockReturnValue(mockUser);
      
      const result = userService.getUserById('1');
      
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });
    it('should return failure when user does not exist', () => {
      
      userRepository.findById.mockReturnValue(undefined);
      
      const result = userService.getUserById('999');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Usuário não encontrado');
      expect(userRepository.findById).toHaveBeenCalledWith('999');
    });
  });
  describe('createUser', () => {
    it('should return success and user when user is created', () => {
      
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        type: 'user',
        password: 'password'
      };
      
      const expectedUser = { ...userData, id: 'new-id' };
      
      userRepository.findByEmail.mockReturnValue(undefined);
      userRepository.add.mockImplementation((user) => {
        user.id = 'new-id';
      });
      
      const result = userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.user).toHaveProperty('id');
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.add).toHaveBeenCalledWith(expect.objectContaining(userData));
    });
    it('should return failure when email already exists', () => {
      
      const userData = {
        name: 'Duplicate User',
        email: 'existing@example.com',
        type: 'user',
        password: 'password'
      };
      
      userRepository.findByEmail.mockReturnValue({ id: '123', email: userData.email });
      
      const result = userService.createUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email já cadastrado');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.add).not.toHaveBeenCalled();
    });
    it('should return failure when required fields are missing', () => {
      
      const incompleteUser = {
        name: 'Incomplete User',
        
        type: 'user',
        password: 'password'
      };
      
      const result = userService.createUser(incompleteUser);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Campos obrigatórios não informados');
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.add).not.toHaveBeenCalled();
    });
  });
  describe('updateUser', () => {
    it('should return success and updated user when update is successful', () => {
      
      const userId = '123';
      const existingUser = {
        id: userId,
        name: 'Original Name',
        email: 'user@example.com',
        type: 'user',
        password: 'password'
      };
      
      const updateData = {
        name: 'Updated Name',
        type: 'admin'
      };
      
      const expectedUpdatedUser = {
        ...existingUser,
        name: updateData.name,
        type: updateData.type
      };
      
      userRepository.findById.mockReturnValue(existingUser);
      userRepository.update.mockImplementation(() => {});
      
      const result = userService.updateUser(userId, updateData);
      
      expect(result.success).toBe(true);
      expect(result.user).toEqual(expect.objectContaining({
        id: userId,
        name: updateData.name,
        type: updateData.type,
        email: existingUser.email
      }));
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        name: updateData.name,
        type: updateData.type
      }));
    });
    it('should return failure when user does not exist', () => {
      
      const userId = '999';
      const updateData = { name: 'New Name' };
      
      userRepository.findById.mockReturnValue(undefined);
      
      const result = userService.updateUser(userId, updateData);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Usuário não encontrado');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
    it('should return failure when trying to update to an existing email', () => {
      
      const userId = '123';
      const existingUser = {
        id: userId,
        name: 'Original Name',
        email: 'user@example.com',
        type: 'user',
        password: 'password'
      };
      
      const updateData = {
        email: 'existing@example.com'
      };
      
      userRepository.findById.mockReturnValue(existingUser);
      userRepository.findByEmail.mockReturnValue({ id: '456', email: updateData.email });
      
      const result = userService.updateUser(userId, updateData);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email já cadastrado');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(updateData.email);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
  describe('deleteUser', () => {
    it('should return success when user is deleted', () => {
      
      const userId = '123';
      const existingUser = { id: userId, name: 'User to Delete' };
      
      userRepository.findById.mockReturnValue(existingUser);
      userRepository.remove.mockImplementation(() => {});
      
      const result = userService.deleteUser(userId);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Usuário removido com sucesso');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.remove).toHaveBeenCalledWith(userId);
    });
    it('should return failure when user does not exist', () => {
      
      const userId = '999';
      
      userRepository.findById.mockReturnValue(undefined);
      
      const result = userService.deleteUser(userId);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Usuário não encontrado');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.remove).not.toHaveBeenCalled();
    });
  });
}); 