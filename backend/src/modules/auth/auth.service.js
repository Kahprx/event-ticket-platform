import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";

const publicUser = ({ id, name, email, role, status, avatar, phone, createdAt }) => ({ id, name, email, role, status, avatar, phone, createdAt });

function signToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, { subject: user.id, expiresIn: env.JWT_EXPIRES_IN });
}

export async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true, status: true, avatar: true, phone: true, createdAt: true },
    });
    return { user: publicUser(user), token: signToken(user) };
  } catch (error) {
    if (error?.code === "P2002") throw new AppError("An account with this email already exists", 409);
    throw error;
  }
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && user.status === "ACTIVE" && await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password", 401);
  return { user: publicUser(user), token: signToken(user) };
}

export async function updateProfile(userId, input) {
  const user = await prisma.user.update({
    where: { id: userId }, data: input,
    select: { id: true, name: true, email: true, role: true, status: true, avatar: true, phone: true, createdAt: true },
  });
  return publicUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new AppError("Current password is incorrect", 400);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { message: "Password updated" };
}
