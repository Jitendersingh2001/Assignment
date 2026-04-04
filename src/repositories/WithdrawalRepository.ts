import mongoose from "mongoose";
import { Withdrawal } from "@/models";

export const WithdrawalRepository = {
  
  // function to create a withdrawal
  create(data: {
    userId: string;
    amountMinor: number;
    destination: string;
    status?: string;
  }) {
    return Withdrawal.create(data);
  },

  // function to find a withdrawal by ID
  findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Withdrawal.findById(id).lean();
  },

  // function to find withdrawals by user ID
  findByUserId(userId: string, limit = 20, skip = 0) {
    return Withdrawal.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  },

  // function to update the status of a withdrawal
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
