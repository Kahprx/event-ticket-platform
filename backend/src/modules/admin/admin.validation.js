import { z } from "zod";

const roleKey = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z][A-Z0-9_]*$/.test(value), "Khoá vai trò chỉ dùng chữ in hoa, số và dấu gạch dưới");

const accountStatus = z.enum(["active", "locked"]);

export const accountCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(30).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  roleKey: roleKey.optional().default("CUSTOMER"),
  status: accountStatus.optional().default("active"),
}).strict();

const accountUpdateBase = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  roleKey: roleKey.optional(),
  status: accountStatus.optional(),
}).strict();

const hasData = (value) => Object.keys(value).length > 0;

export const accountUpdateSchema = accountUpdateBase.refine(hasData, "Không có dữ liệu để cập nhật");

export const roleCreateSchema = z.object({
  key: roleKey,
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  permissions: z.array(z.string().trim().min(1).max(80)).max(40).optional().default([]),
}).strict();

const roleUpdateBase = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  permissions: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
}).strict();

export const roleUpdateSchema = roleUpdateBase.refine(hasData, "Không có dữ liệu để cập nhật");

export const customerCreateSchema = accountCreateSchema.omit({ roleKey: true });
export const customerUpdateSchema = accountUpdateBase.omit({ roleKey: true }).refine(hasData, "Không có dữ liệu để cập nhật");
