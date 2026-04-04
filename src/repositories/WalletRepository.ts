import mongoose from "mongoose";
import { Wallet } from "@/models";

export const WalletRepository = {

  // function to find a wallet by user ID
  findByUserId(userId: string) {
    return Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
  },
  
  // function to deduct balance from a wallet
  deductBalance(userId: string, amountMinor: number) {
    return Wallet.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        balanceMinor: { $gte: amountMinor },
      },
      { $inc: { balanceMinor: -amountMinor } },
      { new: false }
    );
  },
};
