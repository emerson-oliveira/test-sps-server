const authService = require('../services/auth.service');

class AuthController {
  login = (req, res) => {
    const { email, password } = req.body;
    
    const result = authService.login(email, password);
    
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    
    return res.json({ token: result.token });
  }
}

module.exports = new AuthController(); 