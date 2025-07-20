import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  connectionData: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["connected", "disconnected", "connecting", "disconnecting"],
    default: "disconnected",
  },
  lastConnected: {
    type: Date,
    default: null,
  },
});

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
