const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');
const usersRoutes = require('./routes/users.js');
const { verifyToken } = require('./middleware/auth.js');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);

app.use(verifyToken);
app.use('/users', usersRoutes);

module.exports = app;