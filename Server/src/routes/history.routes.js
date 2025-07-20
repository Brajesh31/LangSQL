import express from "express";
import {
  getHistory,
  getPromptHistory,
} from "../controllers/history.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/query", authMiddleware, getHistory);
router.get("/prompt", authMiddleware, getPromptHistory);

export default router;
