import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import { publicUser } from "../auth/auth.service.js";

const accountSelect = {
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
  _count: { select: { orders: true, tickets: true } },
};

const toAccountRow = (user) => ({
  ...publicUser(user),
  bookings: user._count?.orders || 0,
  tickets: user._count?.tickets || 0,
});

const toStatus = (value) => (value === "locked" ? "BLOCKED" : value === "active" ? "ACTIVE" : value);

function buildAccountWhere({ query, role, status }) {
  const where = {};
  const keyword = String(query || "").trim();
  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { email: { contains: keyword, mode: "insensitive" } },
      { city: { contains: keyword, mode: "insensitive" } },
    ];
  }
  if (role && role !== "all") where.roleKey = role;
  if (status && status !== "all") where.status = toStatus(status);
  return where;
}

async function ensureRole(roleKey) {
  const role = await prisma.role.findUnique({ where: { key: roleKey } });
  if (!role) throw new AppError(`Vai trò ${roleKey} không tồn tại`, 400);
  return role;
}

export async function listAccounts(params = {}) {
  const users = await prisma.user.findMany({
    where: buildAccountWhere(params),
    select: accountSelect,
    orderBy: { createdAt: "desc" },
  });
  return users.map(toAccountRow);
}

export async function listCustomers(params = {}) {
  return listAccounts({ ...params, role: "CUSTOMER" });
}

export async function createAccount({ name, email, password, phone, city, roleKey = "CUSTOMER", status = "active" }) {
  await ensureRole(roleKey);
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone, city, roleKey, status: toStatus(status) },
      select: accountSelect,
    });
    return toAccountRow(user);
  } catch (error) {
    if (error?.code === "P2002") throw new AppError("Email này đã được sử dụng", 409);
    throw error;
  }
}

export async function createCustomer(input) {
  return createAccount({ ...input, roleKey: "CUSTOMER" });
}

export async function updateAccount(id, input) {
  const data = { ...input };
  if (data.roleKey) await ensureRole(data.roleKey);
  if (data.status) data.status = toStatus(data.status);

  try {
    const user = await prisma.user.update({ where: { id }, data, select: accountSelect });
    return toAccountRow(user);
  } catch (error) {
    if (error?.code === "P2025") throw new AppError("Không tìm thấy tài khoản", 404);
    throw error;
  }
}

export async function deleteAccount(id, currentUserId) {
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, roleKey: true, name: true } });
  if (!target) throw new AppError("Không tìm thấy tài khoản", 404);
  if (target.id === currentUserId) throw new AppError("Không thể xoá tài khoản đang đăng nhập", 400);
  if (target.roleKey === "ADMIN") {
    const admins = await prisma.user.count({ where: { roleKey: "ADMIN" } });
    if (admins <= 1) throw new AppError("Không thể xoá quản trị viên cuối cùng", 400);
  }
  await prisma.user.delete({ where: { id } });
  return { id, name: target.name };
}

const roleWithCount = (role) => ({
  key: role.key,
  name: role.name,
  description: role.description,
  permissions: Array.isArray(role.permissions) ? role.permissions : [],
  isSystem: role.isSystem,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
  userCount: role._count?.users || 0,
});

export async function listRoles() {
  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: [{ isSystem: "desc" }, { key: "asc" }],
  });
  return roles.map(roleWithCount);
}

export async function createRole({ key, name, description, permissions = [] }) {
  try {
    const role = await prisma.role.create({
      data: { key, name, description, permissions },
      include: { _count: { select: { users: true } } },
    });
    return roleWithCount(role);
  } catch (error) {
    if (error?.code === "P2002") throw new AppError("Khoá vai trò này đã tồn tại", 409);
    throw error;
  }
}

export async function updateRole(key, input) {
  try {
    const role = await prisma.role.update({
      where: { key },
      data: input,
      include: { _count: { select: { users: true } } },
    });
    return roleWithCount(role);
  } catch (error) {
    if (error?.code === "P2025") throw new AppError("Không tìm thấy vai trò", 404);
    throw error;
  }
}

export async function deleteRole(key) {
  const role = await prisma.role.findUnique({ where: { key }, include: { _count: { select: { users: true } } } });
  if (!role) throw new AppError("Không tìm thấy vai trò", 404);
  if (role.isSystem) throw new AppError("Không thể xoá vai trò hệ thống", 400);
  if (role._count.users > 0) throw new AppError("Vai trò này vẫn có tài khoản sử dụng", 400);
  await prisma.role.delete({ where: { key } });
  return { key };
}
