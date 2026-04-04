import mongoose from "mongoose";
import { Withdrawal } from "@/models";

export const WithdrawalRepository = {
  create(data: {
    userId: string;
    amountMinor: number;
    destination: string;
    status?: string;
  }) {
    return Withdrawal.create(data);
  },

  findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Withdrawal.findById(id).lean();
  },

  findByUserId(userId: string, limit = 20, skip = 0) {
    return Withdrawal.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  },

  updateStatus(
    id: mongoose.Types.ObjectId,
    status: string,
    failureReason?: string,
    session?: mongoose.ClientSession
  ) {
    return Withdrawal.findByIdAndUpdate(
      id,
      {
        status,
        ...(failureReason && { failureReason }),
      },
      { new: true, session }
    );
  },
};
