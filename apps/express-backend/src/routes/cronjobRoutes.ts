import express from "express";
import {
  createCronjob,
  cronTestRun,
  deleteCronjob,
  disableCronjob,
  enableCronjob,
  testPoint,
  updateCronjob,
} from "../controllers/cronjobController";

const router = express.Router();

router.post("/create", createCronjob);

router.post("/test-run", cronTestRun);

router.put("/enable", enableCronjob);

router.put("/disable", disableCronjob);

router.delete("/delete", deleteCronjob);

router.put("/edit", updateCronjob);

router.get("/test",testPoint)

export default router;
