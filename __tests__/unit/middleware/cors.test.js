const { handleCorsError } = require('../../../src/middleware/cors');

describe('CORS Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {
        origin: 'http://unauthorized-origin.com'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  it('should handle CORS errors', () => {
    const err = new Error('Acesso bloqueado pela política de CORS');
    
    handleCorsError(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Acesso não autorizado',
      message: 'Esta origem não tem permissão para acessar este recurso.',
      origin: 'http://unauthorized-origin.com'
    }));
    
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass non-CORS errors to next middleware', () => {
    const err = new Error('Outro tipo de erro');
    
    handleCorsError(err, req, res, next);
    
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    
    expect(next).toHaveBeenCalledWith(err);
  });
}); 