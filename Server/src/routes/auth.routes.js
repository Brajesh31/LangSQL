import express from "express";

//validators imports
import {
  validateRegistration,
  validateLogin,
} from "../validators/auth.validator.js";
// import { singleUpload } from "../middlewares/multer.middleware.js";

//controllers imports
import {
  register,
  login,
  logout,
  socialAuth,
  completeTutorial,
  currentUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

//routes
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.post("/social/google", socialAuth);
router.post("/social/github", socialAuth);
router.post("/tutorial/complete", authMiddleware, completeTutorial);
router.post("/logout", logout);
router.get("/user", authMiddleware, currentUser);
export default router;
