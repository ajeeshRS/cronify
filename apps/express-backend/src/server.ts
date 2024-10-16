import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cronjobRoutes from "./routes/cronjobRoutes";
import { loadCronJobs } from "./services/cronJobService";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/v1/cronjob", cronjobRoutes);

export const startServer = async () => {
  await loadCronJobs();
  app.listen(PORT, () => {
    console.log(`Server running on localhost port ${PORT}`);
  });
};

startServer();
