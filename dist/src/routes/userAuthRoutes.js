"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const adminController_1 = require("../controllers/adminController");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message:
//     "Too many requests from this IP address,please try again after 15 minutes",
// });
//User Routes
router.route("/register").post(authController_1.register);
router.route("/login").post(authController_1.logIn);
router.route("/reset-password").post(authController_1.resetPassword);
router.route("/logout").get(utils_1.authenticateToken, utils_1.userValidation, authController_1.logOut);
router.route("/refresh-token").post(authController_1.refreshTokenHandler);
//Admin route
router
    .route("/get-all-users")
    .get(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.getAllUsers);
router
    .route("/get-user/:id")
    .get(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.getUserById);
exports.default = router;
