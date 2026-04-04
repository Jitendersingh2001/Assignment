import { Router } from "express";
import { WithdrawalController } from "@/controllers/WithdrawalController";
import { validate, createWithdrawalSchema, idParamSchema } from "@/middlewares/validate";
import { idempotency } from "@/middlewares/idempotency";

const router = Router();

// route to initiate a withdrawal
router.post(
  "/",
  idempotency,
  validate(createWithdrawalSchema),
  WithdrawalController.initiate
);

// route to get a withdrawal by ID
router.get("/:id", validate(idParamSchema, "params"), WithdrawalController.getById);

export default router;
