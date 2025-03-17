const handleCorsError = (err, req, res, next) => {
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Acesso não autorizado',
      message: 'Esta origem não tem permissão para acessar este recurso.',
      origin: req.headers.origin || 'Origem desconhecida'
    });
  }
  next(err);
};

module.exports = { handleCorsError }; 