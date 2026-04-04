import { StatusCodes } from "http-status-codes";
import { ErrorCodes, type ErrorCode } from "@/constants/errorCodes";
import { ErrorMessages } from "@/constants/errorMessages";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;

  constructor(message: string, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, code: ErrorCode | string = ErrorCodes.INTERNAL_ERROR) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InsufficientFundsError extends AppError {
  constructor() {
    super(ErrorMessages.INSUFFICIENT_FUNDS, StatusCodes.UNPROCESSABLE_ENTITY, ErrorCodes.INSUFFICIENT_FUNDS);
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super(ErrorMessages.NOT_FOUND("User"), StatusCodes.NOT_FOUND, ErrorCodes.USER_NOT_FOUND);
  }
}

export class UserSuspendedError extends AppError {
  constructor(status: string) {
    super(ErrorMessages.ACCOUNT_NOT_ACTIVE(status), StatusCodes.FORBIDDEN, ErrorCodes.ACCOUNT_NOT_ACTIVE);
  }
}

export class WalletNotFoundError extends AppError {
  constructor() {
    super(ErrorMessages.NOT_FOUND("Wallet"), StatusCodes.NOT_FOUND, ErrorCodes.WALLET_NOT_FOUND);
  }
}

export class WithdrawalNotFoundError extends AppError {
  constructor() {
    super(ErrorMessages.NOT_FOUND("Withdrawal"), StatusCodes.NOT_FOUND, ErrorCodes.WITHDRAWAL_NOT_FOUND);
  }
}
