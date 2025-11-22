// Error handler middleware
const errorHandler = (err, req, res, next) => {
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;
