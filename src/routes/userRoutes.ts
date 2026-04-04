import { Router } from "express";
import { WithdrawalController } from "@/controllers/WithdrawalController";
import { validate, userIdParamSchema } from "@/middlewares/validate";

const router = Router();

router.get(
  "/:userId/withdrawals",
  validate(userIdParamSchema, "params"),
  WithdrawalController.getByUser
);

export default router;
