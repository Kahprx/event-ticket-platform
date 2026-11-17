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
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
