import express from "express";
import {
  createCronjob,
  cronTestRun,
  disableCronjob,
  enableCronjob,
} from "../controllers/cronjobController";

const router = express.Router();

router.post("/create", createCronjob);

router.post("/test-run", cronTestRun);

router.put("/enable", enableCronjob);

router.put("/disable", disableCronjob);

export default router;
