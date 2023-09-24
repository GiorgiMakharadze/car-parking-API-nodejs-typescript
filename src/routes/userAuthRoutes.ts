import { Router } from "express";
import { register, logIn } from "../controllers/authController";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(logIn);
router.route("/logout").get();

export default router;
