import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { validateBody } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./chatbot.controller.js";
import { askQuestionSchema } from "./chatbot.validation.js";

const router = Router();
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Public nhưng có giới hạn tần suất; chatbot chỉ đọc dữ liệu sự kiện, không ghi.
router.post("/ask", chatLimiter, validateBody(askQuestionSchema), asyncHandler(controller.ask));

export default router;
