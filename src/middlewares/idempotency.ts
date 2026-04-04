import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorCodes } from "@/constants/errorCodes";
import { ErrorMessages } from "@/constants/errorMessages";
import { IdempotencyKey } from "@/models";
import logger from "@/utils/logger";

const TTL_MS = 24 * 60 * 60 * 1000; 

export async function idempotency(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-idempotency-key"] as string | undefined;
  if (!key) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: ErrorMessages.MISSING_IDEMPOTENCY_KEY,
      code: ErrorCodes.MISSING_IDEMPOTENCY_KEY,
    });
    return;
  }

  try {
    const existing = await IdempotencyKey.findOne({ key }).lean();

    if (existing) {
      logger.info("Replaying idempotent response", { key });
      res.status(existing.statusCode).json(existing.response);
      return;
    }

    const originalJson = res.json.bind(res);

    res.json = function (data: unknown): Response {
      IdempotencyKey.create({
        key,
        statusCode: res.statusCode,
        response: data,
        expiresAt: new Date(Date.now() + TTL_MS),
      }).catch((e: Error) =>
        logger.warn("Could not save idempotency key", { key, error: e.message })
      );

      return originalJson(data);
    };

    next();
  } catch (err) {
    next(err);
  }
}
