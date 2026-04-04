import { Router } from "express";
import withdrawalRoutes from "@/routes/withdrawalRoutes";
import userRoutes from "@/routes/userRoutes";

const router = Router();

router.use("/withdrawals", withdrawalRoutes);
router.use("/users", userRoutes);

export default router;
