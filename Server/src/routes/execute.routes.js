import express from "express";
import { executeDBQuery,generateQuery } from "../controllers/execute.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, executeDBQuery);
router.post("/ai/generate", authMiddleware, generateQuery);

export default router;
