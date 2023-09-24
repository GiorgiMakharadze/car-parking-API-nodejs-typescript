import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  logIn,
  refreshTokenHandler,
  resetPassword,
  logOut,
} from "../controllers/authController";

const router = Router();
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message:
//     "Too many requests from this IP address,please try again after 15 minutes",
// });

router.route("/register").post(register);
router.route("/login").post(logIn);
router.route("/reset-password").post(resetPassword);
router.route("/logout").get(logOut);

router.route("/refresh-token").post(refreshTokenHandler);

export default router;
