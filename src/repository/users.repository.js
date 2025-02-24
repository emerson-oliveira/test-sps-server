const { v4: uuidv4 } = require('uuid');

const users = [];

users.push({
  id: uuidv4(),
  name: 'admin',
  email: 'admin@spsgroup.com.br',
  type: 'admin',
  password: '1234',
});

const getAll = () => users;

const findByEmail = (email) => {
  return users.find((u) => u.email === email);
};

const findById = (id) => {
  return users.find((u) => u.id === id);
};

const add = (user) => {
  user.id = uuidv4();
  users.push(user);
};

const update = (id, updatedUser) => {
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser, id: users[index].id };
  }
};

const remove = (id) => {
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users.splice(index, 1);
  }
};

module.exports = { getAll, findByEmail, findById, add, update, remove };