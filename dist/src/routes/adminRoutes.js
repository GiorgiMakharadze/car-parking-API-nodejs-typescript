"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   message:
//     "Too many requests from this IP address,please try again after 15 minutes",
// });
//Admin route
router
    .route("/get-all-users")
    .get(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.getAllUsers);
router
    .route("/get-user/:id")
    .get(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.getUserById)
    .delete(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.deleteUser);
router
    .route("/get-user/grant-admin/:id")
    .patch(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.makeUserAdmin);
router
    .route("/parking-zone")
    .get(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.getAllParkingZones)
    .post(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.createParkingZone);
router
    .route("/parking-zone/:id")
    .get(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.getParkingZoneById)
    .delete(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.deleteParkingZone)
    .patch(utils_1.authenticateToken, utils_1.adminValidation, adminController_1.updateParkingZone);
exports.default = router;
