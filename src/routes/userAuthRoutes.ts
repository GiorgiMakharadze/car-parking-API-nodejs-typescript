import { Router } from "express";
import {
  register,
  logIn,
  refreshTokenHandler,
  resetPassword,
  logOut,
} from "../controllers/authController";
import { userValidation, authenticateToken } from "../utils";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(logIn);
router.route("/reset-password").post(resetPassword);
router.route("/logout").get(authenticateToken, userValidation, logOut);
router.route("/refresh-token").post(refreshTokenHandler);

export default router;
