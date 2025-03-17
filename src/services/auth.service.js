const jwt = require('jsonwebtoken');
const userRepository = require('../repository/users.repository');
require('dotenv').config();

const { SECRET_KEY } = process.env;

class AuthService {
  login(email, password) {
    const user = userRepository.findByEmail(email);
    
    if (!user || user.password !== password) {
      return { success: false, message: 'Credenciais inválidas' };
    }

    const token = jwt.sign(
      { email: user.email, type: user.type, name: user.name },
      SECRET_KEY,
      {
        expiresIn: '1h',
      }
    );

    return { success: true, token };
  }
}

module.exports = new AuthService(); 