import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const prisma = new PrismaClient();

const roles = [
  {
    key: "CUSTOMER",
    name: "Khách hàng",
    description: "Đặt vé, xem vé và quản lý hồ sơ cá nhân",
    permissions: ["event:read", "ticket:create", "ticket:read", "profile:update"],
    isSystem: true,
  },
  {
    key: "ADMIN",
    name: "Quản trị viên",
    description: "Toàn quyền quản lý sự kiện, đơn hàng, tài khoản và báo cáo",
    permissions: ["admin:access", "event:write", "order:write", "account:write", "report:read"],
    isSystem: true,
  },
];

const accounts = [
  {
    name: "Trần Quản Trị",
    email: "admin@soundpass.vn",
    password: "Admin@123",
    phone: "0902 000 001",
    city: "TP. Hồ Chí Minh",
    roleKey: "ADMIN",
  },
  {
    name: "Nguyễn Minh Anh",
    email: "minhanh.nguyen@example.com",
    password: "User@123",
    phone: "0901 234 567",
    city: "TP. Hồ Chí Minh",
    roleKey: "CUSTOMER",
  },
  {
    name: "Trần Quốc Bảo",
    email: "quocbao.tran@example.com",
    password: "User@123",
    phone: "0903 456 789",
    city: "Hà Nội",
    roleKey: "CUSTOMER",
  },
  {
    name: "Lê Thu Hà",
    email: "thuha.le@example.com",
    password: "User@123",
    phone: "0904 111 222",
    city: "Đà Nẵng",
    roleKey: "CUSTOMER",
  },
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description, permissions: role.permissions, isSystem: true },
      create: role,
    });
  }

  for (const account of accounts) {
    const { password, ...profile } = account;
    await prisma.user.upsert({
      where: { email: account.email },
      update: { ...profile, passwordHash: await bcrypt.hash(password, 12), status: "ACTIVE" },
      create: { ...profile, passwordHash: await bcrypt.hash(password, 12) },
    });
  }

  console.log(`Seeded ${roles.length} roles and ${accounts.length} accounts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
