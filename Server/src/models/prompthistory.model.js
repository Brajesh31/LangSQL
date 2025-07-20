import mongoose from "mongoose";

const promptHistorySchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  executionTime: {
    type: Number, // Time in milliseconds
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success",
  },
  error: {
    type: String, // Only used if the status is 'failed'
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user (if applicable)
    ref: "User", // Assuming you have a User model
    required: false,
  },
  metadata: {
    type: Object, // Any additional information related to the prompt
    default: {},
  },
});

// Create a model based on the schema
const PromptHistory = mongoose.model("PromptHistory", promptHistorySchema);

export default PromptHistory;
