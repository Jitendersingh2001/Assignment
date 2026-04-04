import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "@/constants/errorMessages";
import { AppError } from "@/utils/errors";
import logger from "@/utils/logger";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn("Request error", {
      code: err.code,
      message: err.message,
      method: req.method,
      path: req.path,
    });

    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  logger.error("Unexpected error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
}
