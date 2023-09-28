import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  logIn,
  refreshTokenHandler,
  resetPassword,
  logOut,
} from "../controllers/authController";
import { authenticateToken } from "../utils";

const router = Router();
const authApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: "Too many login attempts, please try again after 5 minutes",
});

router.route("/register").post(authApiLimiter, register);
router.route("/login").post(authApiLimiter, logIn);
router.route("/reset-password").post(authApiLimiter, resetPassword);
router.route("/logout").get(authApiLimiter, authenticateToken, logOut);
router.route("/refresh-token").post(authApiLimiter, refreshTokenHandler);

export default router;
