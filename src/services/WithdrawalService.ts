import mongoose from "mongoose";
import { TransactionLog } from "@/models";
import { UserRepository } from "@/repositories/UserRepository";
import { WalletRepository } from "@/repositories/WalletRepository";
import { WithdrawalRepository } from "@/repositories/WithdrawalRepository";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "@/constants/errorMessages";
import {
  AppError,
  InsufficientFundsError,
  UserNotFoundError,
  UserSuspendedError,
  WalletNotFoundError,
  WithdrawalNotFoundError,
} from "@/utils/errors";
import logger from "@/utils/logger";

export const WithdrawalService = {
  async createWithdrawal(userId: string, amountMinor: number, destination: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new UserNotFoundError();
    if (user.status !== "active") throw new UserSuspendedError(user.status);

    const wallet = await WalletRepository.findByUserId(userId);
    if (!wallet) throw new WalletNotFoundError();

    if (wallet.balanceMinor < amountMinor) throw new InsufficientFundsError();

    logger.info("Withdrawal queued", { userId, amountMinor, destination });

    return WithdrawalRepository.create({ userId, amountMinor, destination, status: "pending" });
  },

  async processWithdrawal(withdrawalId: string) {
    const withdrawal = await WithdrawalRepository.findById(withdrawalId);
    if (!withdrawal) throw new AppError(ErrorMessages.NOT_FOUND("Withdrawal"), StatusCodes.NOT_FOUND);

    // If the job is retried after a partial success, bail out early
    if (withdrawal.status !== "pending") {
      logger.warn("Skipping already-processed withdrawal", {
        withdrawalId,
        status: withdrawal.status,
      });
      return;
    }

    const id = withdrawal._id as mongoose.Types.ObjectId;

    try {
      await WithdrawalRepository.updateStatus(id, "processing");

      const walletBefore = await WalletRepository.deductBalance(
        (withdrawal.userId as mongoose.Types.ObjectId).toString(),
        withdrawal.amountMinor
      );

      if (!walletBefore) throw new InsufficientFundsError();

      const balanceBefore = walletBefore.balanceMinor;
      const balanceAfter = balanceBefore - withdrawal.amountMinor;

      await TransactionLog.create({
        userId: withdrawal.userId,
        walletId: walletBefore._id,
        withdrawalId: withdrawal._id,
        type: "withdrawal_debit",
        amountMinor: withdrawal.amountMinor,
        balanceBeforeMinor: balanceBefore,
        balanceAfterMinor: balanceAfter,
        status: "success",
      });

      await WithdrawalRepository.updateStatus(id, "success");

      logger.info("Withdrawal processed", { withdrawalId, amountMinor: withdrawal.amountMinor });
    } catch (err) {
      const reason = err instanceof AppError ? err.message : "Processing error";
      logger.warn("Withdrawal processing failed", { withdrawalId, reason });
      await WithdrawalRepository.updateStatus(id, "failed", reason);
      throw err;
    }
  },

  async getWithdrawal(id: string) {
    const withdrawal = await WithdrawalRepository.findById(id);
    if (!withdrawal) throw new WithdrawalNotFoundError();
    return withdrawal;
  },

  async getUserWithdrawals(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new UserNotFoundError();
    return WithdrawalRepository.findByUserId(userId);
  },
};
