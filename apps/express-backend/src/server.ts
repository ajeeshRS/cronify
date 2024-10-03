import express, { Request, Response } from "express";
import cors from "cors";
import cronjobRoutes from "./routes/cronjobRoutes";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/api/v1/cronjob", cronjobRoutes);

app.listen(port, () => {
  console.log("Server running on localhost port 3001");
});
