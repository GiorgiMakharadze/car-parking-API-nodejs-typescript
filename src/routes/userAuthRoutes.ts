import { Router } from "express";
import { register } from "../controllers/authController";

const router = Router();

router.route("/register").post(register);
router.route("/login").post();
router.route("/logout").get();

export default router;
