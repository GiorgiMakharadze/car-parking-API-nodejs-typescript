"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const utils_1 = require("../utils");
const router = express_1.default.Router();
router
    .route("/:userId/vehicles")
    .get(utils_1.authenticateToken, utils_1.userValidation, userController_1.getUserVehicles)
    .post(utils_1.authenticateToken, utils_1.userValidation, userController_1.addVehicle);
router
    .route("/:userId/vehicles/:vehicleId")
    .patch(utils_1.authenticateToken, utils_1.userValidation, userController_1.editVehicle)
    .delete(utils_1.authenticateToken, utils_1.userValidation, userController_1.deleteVehicle);
router
    .route("/:userId/reservations")
    .get(utils_1.authenticateToken, utils_1.userValidation, userController_1.userReservations)
    .post(utils_1.authenticateToken, utils_1.userValidation, userController_1.reserveParkingZone);
router
    .route("/:userId/reservations/:reservationId")
    .get(utils_1.authenticateToken, utils_1.userValidation, userController_1.getReservation)
    .delete(utils_1.authenticateToken, utils_1.userValidation, userController_1.deleteReservation);
exports.default = router;
