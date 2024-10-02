import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());

app.listen(port, () => {
  console.log("Server running on localhost port 3001");
});
