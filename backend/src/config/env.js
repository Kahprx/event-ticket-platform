import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// Workspace scripts run from the repository root, so load backend/.env explicitly.
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  // Chatbot RAG. Không bắt buộc: thiếu key thì vẫn trả lời từ dữ liệu sự kiện.
  GEMINI_API_KEY: z.string().trim().optional(),
  GEMINI_MODEL: z.string().trim().default("gemini-2.5-flash"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Cho phép nhiều origin trong development (5173 và 5174).
export const clientOrigins = env.CLIENT_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
