import mongoose, { Schema, type InferSchemaType } from "mongoose";

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balanceMinor: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "balanceMinor must be an integer",
      },
    },
  },
  { timestamps: true }
);

export type WalletDocument = InferSchemaType<typeof walletSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Wallet = mongoose.model("Wallet", walletSchema);
