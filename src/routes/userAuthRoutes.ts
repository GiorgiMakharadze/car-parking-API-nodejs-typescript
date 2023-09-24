import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  logIn,
  refreshTokenHandler,
} from "../controllers/authController";

const router = Router();
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message:
    "Too many requests from this IP address,please try again after 15 minutes",
});

router.route("/register").post(apiLimiter, register);
router.route("/login").post(apiLimiter, logIn);
router.route("/logout").get();

router.route("/token").post(apiLimiter, refreshTokenHandler);

export default router;
