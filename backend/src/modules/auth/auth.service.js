import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";

// Luôn trả về role dạng string (key) cho frontend.
const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  phone: true,
  city: true,
  roleKey: true,
  status: true,
  createdAt: true,
  role: { select: { key: true, name: true } },
};

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role?.key || user.roleKey,
    roleName: user.role?.name || user.roleKey,
    status: user.status,
    avatar: user.avatar,
    phone: user.phone,
    city: user.city,
    createdAt: user.createdAt,
  };
}

function signToken(user) {
  const role = user.role?.key || user.roleKey;
  return jwt.sign({ role }, env.JWT_SECRET, { subject: user.id, expiresIn: env.JWT_EXPIRES_IN });
}

export async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, roleKey: "CUSTOMER" },
      select: userSelect,
    });
    return { user: publicUser(user), token: signToken(user) };
  } catch (error) {
    if (error?.code === "P2002") throw new AppError("Email này đã được sử dụng", 409);
    if (error?.code === "P2003") throw new AppError("Vai trò CUSTOMER chưa tồn tại. Chạy npm run db:seed.", 500);
    throw error;
  }
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email }, select: { ...userSelect, passwordHash: true } });
  const valid = user && user.status === "ACTIVE" && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw new AppError("Email hoặc mật khẩu không đúng", 401);
  return { user: publicUser(user), token: signToken(user) };
}

export async function getUserById(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  return user ? publicUser(user) : null;
}

export async function updateProfile(userId, input) {
  const user = await prisma.user.update({ where: { id: userId }, data: input, select: userSelect });
  return publicUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError("Mật khẩu hiện tại không đúng", 400);
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { message: "Đã cập nhật mật khẩu" };
}
