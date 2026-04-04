import mongoose, { Schema, type InferSchemaType } from "mongoose";

const withdrawalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "amountMinor must be an integer",
      },
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      maxlength: 512,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed"],
      default: "pending",
      index: true,
    },
    failureReason: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

withdrawalSchema.index({ userId: 1, createdAt: -1 });

export type WithdrawalDocument = InferSchemaType<typeof withdrawalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
