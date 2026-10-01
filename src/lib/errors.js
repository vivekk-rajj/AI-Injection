function createError(status, code, message, details) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
}

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function errorMiddleware(error, req, res, next) {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'Something went wrong';

  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  if (status >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(status).json(payload);
}

module.exports = {
  createError,
  asyncHandler,
  errorMiddleware
};
