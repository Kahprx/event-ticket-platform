import { AppError } from "../utils/appError.js";

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Authentication required", 401));
    if (!roles.includes(req.user.role)) return next(new AppError("Forbidden", 403));
    next();
  };
}

export const requireAdmin = authorize("ADMIN");
