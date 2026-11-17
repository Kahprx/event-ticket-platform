// Tài khoản mẫu để chạy demo khi chưa có backend.
// Password chỉ nằm ở file này; khi đăng nhập ta không lưu nó vào state.
import { initialProfile } from "./bookings.js";

export const demoAccounts = [
  {
    id: "user",
    ...initialProfile,
    role: "USER",
    password: "User@123",
  },
  {
    id: "admin",
    name: "Trần Quản Trị",
    email: "admin@soundpass.vn",
    phone: "0902 000 001",
    city: "hcm",
    joinedAt: "2025-01-15",
    notifications: {
      emailReminder: true,
      smsReminder: true,
      promotions: false,
      newEvents: true,
    },
    role: "ADMIN",
    password: "Admin@123",
  },
];

export const findDemoAccount = (email, password) =>
  demoAccounts.find(
    (account) =>
      account.email.toLowerCase() === String(email || "").trim().toLowerCase() &&
      account.password === password,
  );
