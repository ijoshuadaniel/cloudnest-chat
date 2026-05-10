import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const appError = error instanceof AppError ? error : new AppError('Unexpected server error');
  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message
    }
  });
};
