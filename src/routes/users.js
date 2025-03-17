const express = require('express');
const router = express.Router();
const userRepository = require('../repository/users.repository.js');

router.get('/', (req, res) => {
  const users = userRepository.getAll();
  return res.json(users);
});

router.get('/:id', (req, res) => {
  const userId = req.params.id;
  const user = userRepository.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  return res.json(user);
});

router.post('/', (req, res) => {
  const { email, name, type, password } = req.body;
  if (!email || !name || !type || !password) {
    return res
      .status(400)
      .json({ message: 'Campos obrigatórios não informados' });
  }

  const existingUser = userRepository.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }

  const user = { email, name, type, password };
  userRepository.add(user);
  return res.status(201).json(user);
});

router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const existingUser = userRepository.findById(userId);
  if (!existingUser) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const { email, name, type, password } = req.body;

  if (email && email !== existingUser.email) {
    const userWithEmail = userRepository.findByEmail(email);
    if (userWithEmail) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
  }

  const updatedUser = {
    ...existingUser,
    email: email || existingUser.email,
    name: name || existingUser.name,
    type: type || existingUser.type,
    password: password || existingUser.password,
  };

  userRepository.update(userId, updatedUser);
  return res.json(updatedUser);
});

router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  const existingUser = userRepository.findById(userId);
  if (!existingUser) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  userRepository.remove(userId);
  return res.json({ message: 'Usuário removido com sucesso' });
});

module.exports = router;