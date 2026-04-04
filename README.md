---------------------------------------------------------------------------------
Setup
---------------------------------------------------------------------------------

Make sure you have Docker and Node 20+ installed.

cp .env.example .env
docker compose up -d      # starts MongoDB + Redis
npm install
npm run seed              # creates test users, prints their IDs
npm run dev               # API server → http://localhost:3000
npm run worker            # background worker (separate terminal)

---------------------------------------------------------------------------------
Project Structure
---------------------------------------------------------------------------------

src/
├── config/db.ts
├── config/queue.ts          # BullMQ connection and withdrawalQueue
├── constants/
│   ├── errorCodes.ts        # ErrorCodes object — all error code strings
│   ├── errorMessages.ts     # ErrorMessages object — all user-facing error messages
│   └── regex.ts             # Shared regex patterns (e.g. OBJECT_ID_REGEX for MongoDB ObjectIds)
├── models/                  # Mongoose schemas
├── repositories/            # DB access, one file per collection
├── services/                # Business logic (WithdrawalService is the main one)
├── controllers/             # HTTP handlers, just call the service and return
├── routes/
├── middlewares/             # validate, idempotency, errorHandler
├── utils/
│   ├── errors.ts            # AppError base class and typed subclasses
│   └── logger.ts            # Winston logger — console + file transports
├── workers/withdrawalWorker.ts   # BullMQ worker, run separately
└── scripts/seed.ts

logs/
├── combined.log             # all log levels
└── error.log                # error level only (auto-created on first run)


---------------------------------------------------------------------------------
How a withdrawal works
---------------------------------------------------------------------------------

HTTP request (fast path):
1. Request body is validated with Zod
2. Idempotency key is checked
3. User status is checked — suspended/blocked accounts are rejected early
4. Quick balance pre-check to fail fast without hitting the DB with a write
5. Withdrawal record created → pending
6. Job enqueued to BullMQ
7. 202 Accepted returned to client

Background worker (async):
8. Worker picks up the job
9. Status updated → processing
10. Balance deducted atomically (this is the important step)
11. Transaction log written
12. Status updated → success / failed

Client polls GET /api/withdrawals/:id to get the final status.

---------------------------------------------------------------------------------
Concurrency
---------------------------------------------------------------------------------

The part I thought about the most. The problem is classic — two requests for the same user come in at the same time, both read a balance of ₹500, both try to withdraw ₹400, and both succeed. User ends up with -₹300.

The fix is one atomic MongoDB operation:

Wallet.findOneAndUpdate(
  { userId, balanceMinor: { $gte: amountMinor } },
  { $inc: { balanceMinor: -amountMinor } },
  { new: false }
)

The $gte condition and the $inc happen together at the DB level. If two requests race here simultaneously, MongoDB's document lock means only one will match the condition. The other gets null back and throws InsufficientFundsError. No application-level locking needed.

The Wallet schema also has min: 0 on balanceMinor as a fallback — even if somehow a bad update slips through, the DB will reject it.

The balance pre-check earlier in the flow is NOT the real guard — two concurrent requests can both pass it. It's just there to avoid unnecessary DB writes when the balance is clearly insufficient.

---------------------------------------------------------------------------------
Security
---------------------------------------------------------------------------------

A few things I made sure to handle:

--> Input validation — all request data goes through Zod schemas.

--> ObjectId validation  — route params are validated with Zod using OBJECT_ID_REGEX from constants/regex.ts before they touch the DB. Passing a random string as (:id) returns a 400, not a Mongoose cast error.

--> No floats — all amounts are stored as integers in the smallest currency unit (paise for INR).

--> Idempotency — clients can send an (X-Idempotency-Key) header (any unique string, usually a UUID). The first response is cached in MongoDB for 24 hours. If the same key comes in again — network retry, button tap, whatever — we return the cached response and skip processing entirely. Prevents duplicate withdrawals from client-side retries.

--> Error responses — known errors (AppError subclasses) return a structured { error, code } response. All error codes are defined in constants/errorCodes.ts and all user-facing messages in constants/errorMessages.ts. Unknown errors return a generic "Internal server error". Stack traces never leave the server.

--> HTTP status codes — all status codes use the http-status-codes package (e.g. StatusCodes.NOT_FOUND) instead of raw numbers.

---------------------------------------------------------------------------------
Transaction Logs
---------------------------------------------------------------------------------

Every balance change writes a record to TransactionLogs with balanceBefore, balanceAfter, the linked withdrawalId, and a timestamp. The schema has updatedAt disabled so the documents are effectively immutable once written.

---------------------------------------------------------------------------------
API
---------------------------------------------------------------------------------
POST   /api/withdrawals              initiate a withdrawal  (X-Idempotency-Key required)
GET    /api/withdrawals/:id          get withdrawal by ID
GET    /api/users/:userId/withdrawals  list withdrawals for a user

---------------------------------------------------------------------------------
Assumptions & trade-offs
---------------------------------------------------------------------------------

--> No auth — userId comes from the request body here. In a real system it would come from a verified JWT and the body field would be ignored.

--> One wallet per user — the schema enforces a unique index on userId in the Wallet collection. If multi-currency support was needed, the wallet would need a currency field and the unique index would change to (userId, currency).

--> No pagination on list endpoints — the withdrawal history route returns the 20 most recent records. Good enough for now, but a real app would need cursor or page-based pagination once a user has hundreds of withdrawals.
