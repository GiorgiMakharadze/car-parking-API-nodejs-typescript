import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getAllUsers, getUserById } from "../controllers/adminController";
import { adminValidation, authenticateToken } from "../utils";

const router = Router();
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message:
//     "Too many requests from this IP address,please try again after 15 minutes",
// });

//Admin route
router
  .route("/get-all-users")
  .get(authenticateToken, adminValidation, getAllUsers);
router
  .route("/get-user/:id")
  .get(authenticateToken, adminValidation, getUserById);

export default router;
