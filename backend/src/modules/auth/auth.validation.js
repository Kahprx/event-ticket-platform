import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
}).strict();

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0);
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(72), newPassword: z.string().min(8).max(72) }).strict();
