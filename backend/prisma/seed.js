import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";
// Dùng chung dữ liệu mẫu với frontend để ID sự kiện/loại vé khớp nhau khi chạy local.
import { categories, events, locations } from "../../frontend/src/data/events.js";

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

async function seedCatalog() {
  for (const location of locations) {
    await prisma.region.upsert({
      where: { slug: location.id },
      update: { name: location.name },
      create: { id: location.id, name: location.name, slug: location.id },
    });
  }

  for (const category of categories.filter((item) => item.id !== "all")) {
    await prisma.category.upsert({
      where: { slug: category.id },
      update: { name: category.name, description: category.description || null },
      create: { id: category.id, name: category.name, slug: category.id, description: category.description || null },
    });
  }

  for (const event of events) {
    const start = new Date(`${event.date}T${event.time || "00:00"}:00`);
    const end = event.endTime
      ? new Date(`${event.date}T${event.endTime}:00`)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    await prisma.event.upsert({
      where: { id: event.id },
      update: {
        title: event.name,
        description: Array.isArray(event.description) ? event.description.join("\n") : String(event.description || ""),
        imageUrl: event.image || null,
        location: event.venue,
        address: event.address,
        organizer: event.organizer?.name || "Soundpass",
        startDate: start,
        endDate: end,
        status: "PUBLISHED",
        featured: Boolean(event.featured),
        regionId: event.locationId,
        categoryId: event.category,
      },
      create: {
        id: event.id,
        title: event.name,
        slug: event.id,
        description: Array.isArray(event.description) ? event.description.join("\n") : String(event.description || ""),
        imageUrl: event.image || null,
        location: event.venue,
        address: event.address,
        organizer: event.organizer?.name || "Soundpass",
        startDate: start,
        endDate: end,
        status: "PUBLISHED",
        featured: Boolean(event.featured),
        regionId: event.locationId,
        categoryId: event.category,
      },
    });

    for (const type of event.ticketTypes || []) {
      const ticketTypeId = `${event.id}-${type.id}`;
      const quantity = type.total ?? type.quantity ?? 0;
      const sold = type.sold ?? 0;
      const data = {
        eventId: event.id,
        name: type.name,
        description: type.note || null,
        price: type.price,
        quantity,
        sold,
        status: "ACTIVE",
      };
      const { sold: _sold, ...ticketUpdate } = data;
      await prisma.ticketType.upsert({
        where: { id: ticketTypeId },
        update: ticketUpdate,
        create: { id: ticketTypeId, ...data },
      });
    }
  }

  console.log(`Seeded ${locations.length} regions, ${categories.length - 1} categories, ${events.length} events.`);
}

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
  await seedCatalog();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
