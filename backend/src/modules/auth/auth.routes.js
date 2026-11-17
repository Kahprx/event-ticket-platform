import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./auth.controller.js";
import { changePasswordSchema, loginSchema, profileSchema, registerSchema } from "./auth.validation.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false });
router.post("/register", authLimiter, validateBody(registerSchema), asyncHandler(controller.register));
router.post("/login", authLimiter, validateBody(loginSchema), asyncHandler(controller.login));
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.me);
router.put("/profile", authenticate, validateBody(profileSchema), asyncHandler(controller.updateProfile));
router.put("/change-password", authenticate, validateBody(changePasswordSchema), asyncHandler(controller.changePassword));
export default router;
