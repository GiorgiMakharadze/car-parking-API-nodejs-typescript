"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
const adminApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "Too many requests from this IP, please try again after 10 minutes",
});
router.route("/get-all-users").get(adminApiLimiter, adminController_1.getAllUsers);
router
    .route("/get-user/:id")
    .get(adminApiLimiter, adminController_1.getUserById)
    .delete(adminApiLimiter, adminController_1.deleteUser);
router.route("/get-user/grant-admin/:id").patch(adminApiLimiter, adminController_1.makeUserAdmin);
router
    .route("/parking-zone")
    .get(adminApiLimiter, adminController_1.getAllParkingZones)
    .post(adminApiLimiter, adminController_1.createParkingZone);
router
    .route("/parking-zone/:id")
    .get(adminApiLimiter, adminController_1.getParkingZoneById)
    .delete(adminApiLimiter, adminController_1.deleteParkingZone)
    .patch(adminApiLimiter, adminController_1.updateParkingZone);
router.route("/parking-history").get(adminApiLimiter, adminController_1.viewParkingHistory);
exports.default = router;
