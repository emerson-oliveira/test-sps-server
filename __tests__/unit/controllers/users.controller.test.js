const userController = require('../../../src/controllers/users.controller');
const userService = require('../../../src/services/users.service');
jest.mock('../../../src/services/users.service');
describe('User Controller', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  describe('getAllUsers', () => {
    it('should return all users', () => {
      const mockUsers = [{ id: '1', name: 'User 1' }, { id: '2', name: 'User 2' }];
      userService.getAllUsers.mockReturnValue(mockUsers);
      userController.getAllUsers(req, res);
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });
  describe('getUserById', () => {
    it('should return user when found', () => {
      const userId = '123';
      const mockUser = { id: userId, name: 'Test User' };
      
      req.params.id = userId;
      
      userService.getUserById.mockReturnValue({
        success: true,
        user: mockUser
      });
      userController.getUserById(req, res);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
    it('should return 404 when user not found', () => {
      const userId = '999';
      
      req.params.id = userId;
      
      userService.getUserById.mockReturnValue({
        success: false,
        message: 'Usuário não encontrado'
      });
      userController.getUserById(req, res);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    });
  });
  describe('createUser', () => {
    it('should return 201 and user on successful creation', () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        type: 'user',
        password: 'password'
      };
      
      const createdUser = { ...userData, id: 'new-id' };
      
      req.body = userData;
      
      userService.createUser.mockReturnValue({
        success: true,
        user: createdUser
      });
      userController.createUser(req, res);
      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });
    it('should return 400 when validation fails', () => {
      const userData = {
        name: 'Incomplete User',
        type: 'user',
        password: 'password'
      };
      
      req.body = userData;
      
      userService.createUser.mockReturnValue({
        success: false,
        message: 'Campos obrigatórios não informados'
      });
      userController.createUser(req, res);
      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Campos obrigatórios não informados' });
    });
  });
  describe('updateUser', () => {
    it('should return updated user on successful update', () => {
      const userId = '123';
      const updateData = {
        name: 'Updated Name',
        type: 'admin'
      };
      
      const updatedUser = {
        id: userId,
        name: updateData.name,
        type: updateData.type,
        email: 'user@example.com'
      };
      
      req.params.id = userId;
      req.body = updateData;
      
      userService.updateUser.mockReturnValue({
        success: true,
        user: updatedUser
      });
      userController.updateUser(req, res);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });
    it('should return 404 when user not found', () => {
      const userId = '999';
      const updateData = { name: 'Updated Name' };
      
      req.params.id = userId;
      req.body = updateData;
      
      userService.updateUser.mockReturnValue({
        success: false,
        message: 'Usuário não encontrado'
      });
      userController.updateUser(req, res);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    });
    it('should return 400 when validation fails', () => {
      const userId = '123';
      const updateData = { email: 'existing@example.com' };
      
      req.params.id = userId;
      req.body = updateData;
      
      userService.updateUser.mockReturnValue({
        success: false,
        message: 'Email já cadastrado'
      });
      userController.updateUser(req, res);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email já cadastrado' });
    });
  });
  describe('deleteUser', () => {
    it('should return success message on successful deletion', () => {
      const userId = '123';
      
      req.params.id = userId;
      
      userService.deleteUser.mockReturnValue({
        success: true,
        message: 'Usuário removido com sucesso'
      });
      userController.deleteUser(req, res);
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário removido com sucesso' });
    });
    it('should return 404 when user not found', () => {
      const userId = '999';
      
      req.params.id = userId;
      
      userService.deleteUser.mockReturnValue({
        success: false,
        message: 'Usuário não encontrado'
      });
      userController.deleteUser(req, res);
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    });
  });
}); 