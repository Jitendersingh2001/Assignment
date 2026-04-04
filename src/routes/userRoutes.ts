import { Router } from "express";
import { WithdrawalController } from "@/controllers/WithdrawalController";
import { validate, userIdParamSchema } from "@/middlewares/validate";

const router = Router();

// route to get withdrawals for a user
router.get(
  "/:userId/withdrawals",
  validate(userIdParamSchema, "params"),
  WithdrawalController.getByUser
);

export default router;
