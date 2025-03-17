const userRepository = require('../repository/users.repository');

class UserService {
  getAllUsers() {
    return userRepository.getAll();
  }

  getUserById(id) {
    const user = userRepository.findById(id);
    if (!user) {
      return { success: false, message: 'Usuário não encontrado' };
    }
    return { success: true, user };
  }

  createUser(userData) {
    const { email, name, type, password } = userData;
    
    if (!email || !name || !type || !password) {
      return { success: false, message: 'Campos obrigatórios não informados' };
    }

    const existingUser = userRepository.findByEmail(email);
    if (existingUser) {
      return { success: false, message: 'Email já cadastrado' };
    }

    const user = { email, name, type, password };
    userRepository.add(user);
    
    return { success: true, user };
  }

  updateUser(id, userData) {
    const existingUser = userRepository.findById(id);
    if (!existingUser) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    const { email, name, type, password } = userData;

    if (email && email !== existingUser.email) {
      const userWithEmail = userRepository.findByEmail(email);
      if (userWithEmail) {
        return { success: false, message: 'Email já cadastrado' };
      }
    }

    const updatedUser = {
      ...existingUser,
      email: email || existingUser.email,
      name: name || existingUser.name,
      type: type || existingUser.type,
      password: password || existingUser.password,
    };

    userRepository.update(id, updatedUser);
    
    return { success: true, user: updatedUser };
  }

  deleteUser(id) {
    const existingUser = userRepository.findById(id);
    if (!existingUser) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    userRepository.remove(id);
    
    return { success: true, message: 'Usuário removido com sucesso' };
  }
}

module.exports = new UserService(); 