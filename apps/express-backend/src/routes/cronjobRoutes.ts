import express from "express";
import { createCronjob, cronTestRun } from "../controllers/cronjobController";

const router = express.Router();

router.post("/create", createCronjob);

router.post("/test-run", cronTestRun);

export default router;
