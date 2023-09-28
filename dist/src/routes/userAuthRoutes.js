"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
const authApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 15,
    message: "Too many login attempts, please try again after 5 minutes",
});
router.route("/register").post(authApiLimiter, authController_1.register);
router.route("/login").post(authApiLimiter, authController_1.logIn);
router.route("/reset-password").post(authApiLimiter, authController_1.resetPassword);
router.route("/logout").get(authApiLimiter, utils_1.authenticateToken, authController_1.logOut);
router.route("/refresh-token").post(authApiLimiter, authController_1.refreshTokenHandler);
exports.default = router;
