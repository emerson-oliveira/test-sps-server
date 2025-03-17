const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');
const usersRoutes = require('./routes/users.js');
const { verifyToken } = require('./middleware/auth.js');
const { handleCorsError } = require('./middleware/cors.js');
const corsOptions = require('./config/cors.config.js');

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use('/auth', authRoutes);
app.use(verifyToken);
app.use('/users', usersRoutes);

app.use(handleCorsError);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'production' ? 'Ocorreu um erro interno.' : err.message
  });
});

module.exports = app;
