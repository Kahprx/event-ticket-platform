import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./admin.controller.js";
import {
  accountCreateSchema,
  accountUpdateSchema,
  customerCreateSchema,
  customerUpdateSchema,
  roleCreateSchema,
  roleUpdateSchema,
} from "./admin.validation.js";

const router = Router();

// Mọi API quản trị đều yêu cầu đăng nhập và vai trò ADMIN.
router.use(authenticate, requireAdmin);

router.get("/accounts", asyncHandler(controller.listAccounts));
router.post("/accounts", validateBody(accountCreateSchema), asyncHandler(controller.createAccount));
router.put("/accounts/:id", validateBody(accountUpdateSchema), asyncHandler(controller.updateAccount));
router.delete("/accounts/:id", asyncHandler(controller.deleteAccount));

router.get("/customers", asyncHandler(controller.listCustomers));
router.post("/customers", validateBody(customerCreateSchema), asyncHandler(controller.createCustomer));
router.put("/customers/:id", validateBody(customerUpdateSchema), asyncHandler(controller.updateCustomer));
router.delete("/customers/:id", asyncHandler(controller.deleteCustomer));

router.get("/roles", asyncHandler(controller.listRoles));
router.post("/roles", validateBody(roleCreateSchema), asyncHandler(controller.createRole));
router.put("/roles/:key", validateBody(roleUpdateSchema), asyncHandler(controller.updateRole));
router.delete("/roles/:key", asyncHandler(controller.deleteRole));

export default router;
