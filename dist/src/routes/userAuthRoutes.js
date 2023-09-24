"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many requests from this IP address,please try again after 15 minutes",
});
router.route("/register").post(apiLimiter, authController_1.register);
router.route("/login").post(apiLimiter, authController_1.logIn);
router.route("/logout").get();
router.route("/refresh-token").post(apiLimiter, authController_1.refreshTokenHandler);
exports.default = router;
