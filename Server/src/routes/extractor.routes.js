import express from "express";

import { extractMetadata } from "../services/metadata.service.js";

const router = express.Router();

router.post("/extract", async (req, res) => {
  try {
    const metadata = await extractMetadata(req.body);
    res.status(200).json({
      message: "Database connected and metadata saved!",
      data: metadata,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
