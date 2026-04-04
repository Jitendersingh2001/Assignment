import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "@/config/db";
import { User, Wallet, Withdrawal, TransactionLog } from "@/models";

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await TransactionLog.deleteMany({});
  await Withdrawal.deleteMany({});
  await Wallet.deleteMany({});
  await User.deleteMany({});

  console.log("Seeding users and wallets...");

  const users = await User.insertMany([
    { email: "alice@example.com", name: "Alice", status: "active" },
    { email: "bob@example.com", name: "Bob", status: "active" },
    { email: "charlie@example.com", name: "Charlie", status: "suspended" },
  ]);

  await Wallet.insertMany([
    { userId: users[0]._id, balanceMinor: 100_000 },
    { userId: users[1]._id, balanceMinor: 50_000 },
    { userId: users[2]._id, balanceMinor: 25_000 },
  ]);

  console.log("\nSeeded users (use these IDs to test the API):");
  users.forEach((u) => {
    console.log(`  ${u.name} (${u.status}): ${u._id}`);
  });

  await mongoose.disconnect();
  console.log("\nDone.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
