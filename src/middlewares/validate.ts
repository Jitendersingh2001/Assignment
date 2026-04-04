import { z, type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "@/constants/errorMessages";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");

export const createWithdrawalSchema = z.object({
  userId: objectId,
  amountMinor: z
    .number()
    .int("amountMinor must be an integer")
    .positive("amountMinor must be greater than 0"),
  destination: z.string().trim().min(1).max(512),
});

export const idParamSchema = z.object({
  id: objectId,
});

export const userIdParamSchema = z.object({
  userId: objectId,
});

type ParseTarget = "body" | "params" | "query";

export function validate(schema: ZodType, target: ParseTarget = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: ErrorMessages.VALIDATION_FAILED,
        details: result.error.flatten((i) => i.message).fieldErrors,
      });
      return;
    }

    (req as any)[target] = result.data;
    next();
  };
}
