import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cronjobRoutes from "./routes/cronjobRoutes";
import { connectRedis } from "./config/redisConfig";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/v1/cronjob", cronjobRoutes);

const startServer = async () => {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on localhost port ${PORT}`);
  });
};

startServer()
