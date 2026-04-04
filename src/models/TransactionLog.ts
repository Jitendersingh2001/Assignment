import mongoose, { Schema, type InferSchemaType } from "mongoose";

const transactionLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    withdrawalId: {
      type: Schema.Types.ObjectId,
      ref: "Withdrawal",
      index: true,
    },
    type: {
      type: String,
      enum: ["withdrawal_debit", "credit", "adjustment"],
      required: true,
      index: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "amountMinor must be an integer",
      },
    },
    balanceBeforeMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "balanceBeforeMinor must be an integer",
      },
    },
    balanceAfterMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "balanceAfterMinor must be an integer",
      },
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

transactionLogSchema.index({ userId: 1, createdAt: -1 });
transactionLogSchema.index({ walletId: 1, createdAt: -1 });

export type TransactionLogDocument = InferSchemaType<typeof transactionLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TransactionLog = mongoose.model("TransactionLog", transactionLogSchema);
