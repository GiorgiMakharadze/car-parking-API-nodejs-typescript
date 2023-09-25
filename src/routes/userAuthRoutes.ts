import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  logIn,
  refreshTokenHandler,
  resetPassword,
  logOut,
} from "../controllers/authController";
import { getAllUsers, getUserById } from "../controllers/adminController";
import { userValidation, adminValidation, authenticateToken } from "../utils";

const router = Router();
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message:
//     "Too many requests from this IP address,please try again after 15 minutes",
// });

//User Routes
router.route("/register").post(register);
router.route("/login").post(logIn);
router.route("/reset-password").post(resetPassword);
router.route("/logout").get(authenticateToken, userValidation, logOut);

router.route("/refresh-token").post(refreshTokenHandler);

//Admin route
router
  .route("/get-all-users")
  .get(authenticateToken, adminValidation, getAllUsers);
router
  .route("/get-user/:id")
  .get(authenticateToken, adminValidation, getUserById);

export default router;
