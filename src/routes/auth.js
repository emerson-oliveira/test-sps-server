const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { SECRET_KEY } = process.env;
const userRepository = require('../repository/users.repository.js');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = userRepository.findByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { email: user.email, type: user.type, name: user.name },
    SECRET_KEY,
    {
      expiresIn: '1h',
    },
  );
  return res.json({ token });
});

module.exports = router;