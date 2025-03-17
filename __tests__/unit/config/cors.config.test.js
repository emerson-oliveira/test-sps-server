const originalAllowedOrigins = process.env.ALLOWED_ORIGINS;

describe('CORS Configuration', () => {
  afterEach(() => {
    process.env.ALLOWED_ORIGINS = originalAllowedOrigins;
    jest.resetModules();
  });

  it('should allow origins from environment variable', () => {
    process.env.ALLOWED_ORIGINS = 'http://example.com,http://test.com';
    
    const corsOptions = require('../../../src/config/cors.config');
    
    const mockCallback = jest.fn();
    corsOptions.origin('http://example.com', mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });

  it('should deny unauthorized origins', () => {
    process.env.ALLOWED_ORIGINS = 'http://example.com,http://test.com';
    
    const corsOptions = require('../../../src/config/cors.config');
    
    const mockCallback = jest.fn();
    corsOptions.origin('http://unauthorized.com', mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should use default origins when environment variable is not set', () => {
    delete process.env.ALLOWED_ORIGINS;
    
    const corsOptions = require('../../../src/config/cors.config');
    
    const mockCallback = jest.fn();
    corsOptions.origin('http://localhost:3000', mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });

  it('should allow requests without origin (like mobile apps)', () => {
    const corsOptions = require('../../../src/config/cors.config');
    
    const mockCallback = jest.fn();
    corsOptions.origin(null, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });
}); 