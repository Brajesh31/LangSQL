import User from "../models/user.model.js";
import mongoose from "mongoose";
import { createToken, verifyToken } from "../utils/jwt.util.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import firebaseAdmin from "firebase-admin";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const Urole = role || "user";

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already registered", success: false });
    }

    // Create the user in Firebase Authentication
    let firebaseUser;
    try {
      firebaseUser = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: name, // Optional: Store displayName in Firebase
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error registering user with Firebase: " + error.message,
        success: false,
      });
    }

    // Get Firebase UID
    const firebaseUid = firebaseUser.uid;

    // Hash password for MongoDB
    const hashedPassword = await hashPassword(password);

    // Save the user to MongoDB
    const newUser = new User({
      name,
      email,
      role: Urole,
      password: hashedPassword,
      uid: firebaseUid, // Store Firebase UID
    });

    await newUser.save();

    // Create JWT token for the user
    const token = createToken(newUser._id);

    // Send token in the response (optional: you can send it as a cookie too)
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true, // Prevents access to cookie via JavaScript
        sameSite: "strict", // Ensures cookies are sent only in same-origin requests
      })
      .json({
        message: "Registered in successfully",
        user: newUser,
        success: true,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials", success: false });
    }

    // Compare the provided password with the hashed password in the database
    const check = await comparePassword(password, user.password);
    if (!check) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials", success: false });
    }
    user.lastLogin = new Date();
    await user.save();

    // Create a JWT token
    const token = createToken(user._id);
    delete user.password;

    // Send the token in the cookie with proper settings
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true, // Prevents access to cookie via JavaScript
        sameSite: "strict", // Ensures cookies are sent only in same-origin requests
      })
      .json({
        message: "Logged in successfully",
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res
      .status(200)
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const completeTutorial = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    user.isTutorialCompleted = true;
    await user.save();

    return res
      .status(200)
      .json({ message: "Tutorial completed", success: true });
  } catch (error) {
    console.error("Error completing tutorial:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const socialAuth = async (req, res) => {
  try {
    const { auth_token } = req.body;

    // Verify the Firebase ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(auth_token);

    const uid = decodedToken.uid;

    // Try to find existing user
    let user = await User.findOne({ uid: uid }).select("-password");
    let isNewUser = false;

    if (!user) {
      // User doesn't exist, create new user
      isNewUser = true;
      user = new User({
        uid: uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split("@")[0],
        imageURL: decodedToken.picture,
        role: "user",
      });

      await user.save();
    } else {
      // Update existing user's last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Create JWT token
    const token = createToken(user._id);

    // Send response with appropriate message
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: isNewUser ? "Registration successful" : "Login successful",
        user,
        success: true,
        isNewUser,
      });
  } catch (error) {
    console.error("Social auth error:", error);
    return res.status(401).json({
      message: "Authentication failed",
      error: error.message,
      success: false,
    });
  }
};

export const currentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
