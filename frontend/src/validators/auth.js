import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email chưa hợp lệ"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Tên cần ít nhất 2 ký tự").max(100),
  email: z.string().email("Email chưa hợp lệ"),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự").max(72),
});
