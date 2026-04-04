import mongoose from "mongoose";
import { TransactionLog } from "@/models";

type CreateLogData = {
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  withdrawalId: mongoose.Types.ObjectId;
  type: "withdrawal_debit" | "credit" | "adjustment";
  amountMinor: number;
  balanceBeforeMinor: number;
  balanceAfterMinor: number;
  status: "pending" | "success" | "failed";
};

export const TransactionLogRepository = {
  create(data: CreateLogData) {
    return TransactionLog.create(data);
  },

  findByUserId(userId: string, limit = 20, skip = 0) {
    return TransactionLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  },
};
