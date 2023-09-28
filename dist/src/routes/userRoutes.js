"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
const userApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 200,
    message: "Too many requests from this IP, please try again after an hour",
});
router
    .route("/:userId/vehicles")
    .get(userApiLimiter, userController_1.getUserVehicles)
    .post(userApiLimiter, userController_1.addVehicle);
router
    .route("/:userId/vehicles/:vehicleId")
    .patch(userApiLimiter, userController_1.editVehicle)
    .delete(userApiLimiter, userController_1.deleteVehicle);
router
    .route("/:userId/reservations")
    .get(userApiLimiter, userController_1.userReservations)
    .post(userApiLimiter, userController_1.reserveParkingZone);
router
    .route("/:userId/reservations/:reservationId")
    .get(userApiLimiter, userController_1.getReservation)
    .delete(userApiLimiter, userController_1.deleteReservation);
exports.default = router;
