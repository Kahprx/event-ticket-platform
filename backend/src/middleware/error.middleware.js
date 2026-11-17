import { AppError } from "../utils/appError.js";

export function notFound(_req, _res, next) {
  next(new AppError("Route not found", 404));
}

export function errorHandler(error, _req, res, _next) {
  const status = error instanceof AppError ? error.statusCode : 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : error.message,
  });
}
