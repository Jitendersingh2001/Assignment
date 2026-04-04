import mongoose, { Schema } from "mongoose";

const idempotencyKeySchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    statusCode: { type: Number, required: true },
    response: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false }
);

idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IdempotencyKey = mongoose.model("IdempotencyKey", idempotencyKeySchema);
