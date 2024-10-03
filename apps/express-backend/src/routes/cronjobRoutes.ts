import express from "express";
import { createCronjob } from "../controllers/cronjobController";

const router = express.Router();

router.post("/create", createCronjob);

export default router;
