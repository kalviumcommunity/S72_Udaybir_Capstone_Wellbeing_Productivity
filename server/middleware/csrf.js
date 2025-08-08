const csrf = require('express-csrf');

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Custom CSRF error handler
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      message: 'CSRF token validation failed. Please refresh the page and try again.',
      error: 'CSRF_ERROR'
    });
  }
  next(err);
};

module.exports = { csrfProtection, csrfErrorHandler }; 