import QueryHistory from "../models/queeryhistory.model.js";
import PromptHistory from "../models/prompthistory.model.js";

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await QueryHistory.find({ userId }).sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      message: "History fetched successfully",
      data: {
        savedQueries: [],
        executionHistory: history,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPromptHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await PromptHistory.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      message: "Prompt history fetched successfully",
      data: {
        history,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

