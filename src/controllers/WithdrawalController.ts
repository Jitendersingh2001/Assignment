import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { WithdrawalService } from "@/services/WithdrawalService";
import { withdrawalQueue } from "@/config/queue";

export const WithdrawalController = {

  // function to initiate a withdrawal
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

  // function to get a withdrawal by ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const withdrawalResponse = await WithdrawalService.getWithdrawal(id);
      res.json({ success: true, data: withdrawalResponse });
    } catch (err) {
      next(err);
    }
  },

  // function to get withdrawals for a user
  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String(req.params.userId);
      const userWithdrawals = await WithdrawalService.getUserWithdrawals(userId);
      res.json({ success: true, data: userWithdrawals });
    } catch (err) {
      next(err);
    }
  },
};
