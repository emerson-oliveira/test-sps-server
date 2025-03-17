const userService = require('../services/users.service');

class UserController {
  getAllUsers = (req, res) => {
    const users = userService.getAllUsers();
    return res.json(users);
  }

  getUserById = (req, res) => {
    const userId = req.params.id;
    const result = userService.getUserById(userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    return res.json(result.user);
  }

  createUser = (req, res) => {
    const userData = req.body;
    const result = userService.createUser(userData);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    return res.status(201).json(result.user);
  }

  updateUser = (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    
    const result = userService.updateUser(userId, userData);
    
    if (!result.success) {
      if (result.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: result.message });
      }
      return res.status(400).json({ message: result.message });
    }
    
    return res.json(result.user);
  }

  deleteUser = (req, res) => {
    const userId = req.params.id;
    const result = userService.deleteUser(userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    return res.json({ message: result.message });
  }
}

module.exports = new UserController(); 