import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export async function authenticate(req, _res, next) {
  try {
    const [scheme, token] = (req.headers.authorization ?? "").split(" ");
    if (scheme !== "Bearer" || !token) throw new AppError("Authentication required", 401);

    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload !== "object" || !payload.sub) throw new AppError("Invalid token", 401);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        roleKey: true,
        status: true,
        avatar: true,
        phone: true,
        city: true,
        createdAt: true,
        role: { select: { key: true, name: true } },
      },
    });
    if (!user || user.status !== "ACTIVE") throw new AppError("Account is unavailable", 401);

    req.user = { ...user, role: user.role.key };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401));
    }
    next(error);
  }
}
