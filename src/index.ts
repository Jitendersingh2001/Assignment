import "dotenv/config";
import express from "express";
import { connectDB } from "@/config/db";
import "@/models";
import routes from "@/routes";
import { errorHandler } from "@/middlewares/errorHandler";
import logger from "@/utils/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
});

export default app;
