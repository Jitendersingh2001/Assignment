import { Router } from "express";
import { WithdrawalController } from "@/controllers/WithdrawalController";
import { validate, createWithdrawalSchema, idParamSchema } from "@/middlewares/validate";
import { idempotency } from "@/middlewares/idempotency";

const router = Router();

router.post(
  "/",
  idempotency,
  validate(createWithdrawalSchema),
  WithdrawalController.initiate
);

router.get("/:id", validate(idParamSchema, "params"), WithdrawalController.getById);

export default router;
