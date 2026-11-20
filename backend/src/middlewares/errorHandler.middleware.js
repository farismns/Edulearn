const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: statusCode === 500 ? "Internal server error." : err.message,
  };
  if (err.exposeDetails && err.details !== undefined) response.details = err.details;
  res.status(statusCode).json(response);
};

export default errorHandler;
