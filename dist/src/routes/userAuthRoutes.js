"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
router.route("/register").post(authController_1.register);
router.route("/login").post(authController_1.logIn);
router.route("/reset-password").post(authController_1.resetPassword);
router
    .route("/logout")
    .get(utils_1.authenticateToken, utils_1.adminValidation, utils_1.userValidation, authController_1.logOut);
router.route("/refresh-token").post(authController_1.refreshTokenHandler);
exports.default = router;
