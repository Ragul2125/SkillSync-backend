const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  // Only log stack for 500 errors or in development
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
};

export default errorHandler;
