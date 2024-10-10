import express from "express";
import {
  createCronjob,
  cronTestRun,
  deleteCronjob,
  disableCronjob,
  enableCronjob,
} from "../controllers/cronjobController";

const router = express.Router();

router.post("/create", createCronjob);

router.post("/test-run", cronTestRun);

router.put("/enable", enableCronjob);

router.put("/disable", disableCronjob);

router.delete("/delete", deleteCronjob);

export default router;
