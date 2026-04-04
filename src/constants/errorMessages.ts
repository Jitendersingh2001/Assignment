export const ErrorMessages = {
  INTERNAL_ERROR: "Internal server error",
  INSUFFICIENT_FUNDS: "Insufficient wallet balance",
  NOT_FOUND: (name: string) => `${name} not found`,
  ACCOUNT_NOT_ACTIVE: (status: string) => `Account is ${status}`,
  MISSING_IDEMPOTENCY_KEY: "X-Idempotency-Key header is required",
  VALIDATION_FAILED: "Validation failed",
} as const;
