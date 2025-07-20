import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    default: null,
  },

  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isTutorialCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
