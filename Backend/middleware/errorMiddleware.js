// Backend/middleware/errorMiddleware.js
const notFound = (req, res, next) => {
  // Don't reflect the raw URL back (prevents XSS via crafted URLs)
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  // Log for debugging but NEVER expose to client
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Error:', err?.message || err);
  }

  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: 'Something went wrong. Please try again later.',
    // NEVER expose stack traces or raw error messages in any environment
  });
};

module.exports = { notFound, errorHandler };
