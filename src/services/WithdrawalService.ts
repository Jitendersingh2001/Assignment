import { TransactionLog } from "@/models";
import { UserRepository } from "@/repositories/UserRepository";
import { WalletRepository } from "@/repositories/WalletRepository";
import { WithdrawalRepository } from "@/repositories/WithdrawalRepository";
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

  // function to create a withdrawal
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

  // function to process a withdrawal
  async processWithdrawal(withdrawalId: string) {
    const withdrawal = await WithdrawalRepository.findById(withdrawalId);
    
    if (!withdrawal) throw new WithdrawalNotFoundError();

    if (withdrawal.status !== "pending") {
      logger.warn("Skipping already-processed withdrawal", {
        withdrawalId,
        status: withdrawal.status,
      });
      return;
    }

    const id = withdrawal._id;

    try {
      await WithdrawalRepository.updateStatus(id, "processing");

      const walletBefore = await WalletRepository.deductBalance(
        withdrawal.userId.toString(),
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

  // function to get a withdrawal by ID
  async getWithdrawal(id: string) {
    const withdrawal = await WithdrawalRepository.findById(id);
    if (!withdrawal) throw new WithdrawalNotFoundError();
    return withdrawal;
  },

  // function to get withdrawals for a user
  async getUserWithdrawals(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new UserNotFoundError();
    return WithdrawalRepository.findByUserId(userId);
  },
};
