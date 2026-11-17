import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json({ limit: "32kb" }));
app.use(morgan("dev"));
app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);
