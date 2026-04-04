import "dotenv/config";
import { Worker } from "bullmq";
import { connectDB } from "@/config/db";
import "@/models";
import { redisConnection } from "@/config/queue";
import { WithdrawalService } from "@/services/WithdrawalService";
import logger from "@/utils/logger";

async function start() {
  await connectDB();

  const worker = new Worker(
    "withdrawals",
    async (job) => {
      const { withdrawalId } = job.data as { withdrawalId: string };

      logger.info("Processing withdrawal", {
        jobId: job.id,
        withdrawalId,
        attempt: job.attemptsMade + 1,
      });

      await WithdrawalService.processWithdrawal(withdrawalId);
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    logger.info("Job completed", { jobId: job.id, withdrawalId: job.data.withdrawalId });
  });

  worker.on("failed", (job, err) => {
    logger.error("Job failed", {
      jobId: job?.id,
      withdrawalId: job?.data?.withdrawalId,
      attempts: job?.attemptsMade,
      error: err.message,
    });
  });

  logger.info("Withdrawal worker started, waiting for jobs...");
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
