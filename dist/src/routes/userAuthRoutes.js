"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message:
//     "Too many requests from this IP address,please try again after 15 minutes",
// });
router.route("/register").post(authController_1.register);
router.route("/login").post(authController_1.logIn);
router.post("/reset-password", authController_1.resetPassword);
router.route("/logout").get();
router.route("/refresh-token").post(authController_1.refreshTokenHandler);
exports.default = router;
