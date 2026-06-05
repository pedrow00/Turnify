const log = (level, message, meta = {}) => {
    const entry = {
      time: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
    console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
  };
  
  const logger = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
  };
  
  const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info('request', {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms: Date.now() - start,
        userId: req.session?.user?.id ?? null,
      });
    });
    next();
  };
  
  module.exports = { logger, requestLogger };