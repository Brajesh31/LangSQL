import mongoose from "mongoose";

// Define the schema for query history
const queryHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a 'User' model for the users
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "failed",
  },
  dbName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  error: {
    type: String,
    default: "",
  },
  response: {
    type: mongoose.Schema.Types.Mixed, // To store any type of response (e.g., arrays, objects)
    default: {},
  },
  responseTime: {
    type: String,
  },
  rows: {
    type: String,
  },
  affectedRows: {
    type: String,
  },
});

// Create the model
const QueryHistory = mongoose.model("QueryHistory", queryHistorySchema);

export default QueryHistory;
