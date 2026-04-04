import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { WithdrawalService } from "@/services/WithdrawalService";
import { withdrawalQueue } from "@/config/queue";
import { ErrorMessages } from "@/constants/errorMessages";

export const WithdrawalController = {
  async initiate(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, amountMinor, destination } = req.body as {
        userId: string;
        amountMinor: number;
        destination: string;
      };

      const withdrawal = await WithdrawalService.createWithdrawal(userId, amountMinor, destination);

      await withdrawalQueue.add("process", { withdrawalId: withdrawal._id.toString() });

      res.status(StatusCodes.ACCEPTED).json({ success: true, data: withdrawal });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const withdrawalResponse = await WithdrawalService.getWithdrawal(id);
      if (!withdrawalResponse) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: ErrorMessages.NOT_FOUND("Withdrawal") });
      }
      res.json({ success: true, data: withdrawalResponse });
    } catch (err) {
      next(err);
    }
  },

  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const withdrawals = await WithdrawalService.getUserWithdrawals(
        String(req.params.userId)
      );
      res.json({ success: true, data: withdrawals });
    } catch (err) {
      next(err);
    }
  },
};
