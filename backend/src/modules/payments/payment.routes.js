import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./payment.controller.js";
import { confirmPaymentSchema, createOrderSchema } from "./payment.validation.js";

const router = Router();
router.use(authenticate);

router.post("/orders", validateBody(createOrderSchema), asyncHandler(controller.createOrder));
router.get("/orders/:orderCode", asyncHandler(controller.getOrder));
router.post("/confirm", validateBody(confirmPaymentSchema), asyncHandler(controller.confirmPayment));

export default router;
