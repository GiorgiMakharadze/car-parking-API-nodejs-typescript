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
    .get(utils_1.authenticateToken, utils_1.userValidation, userController_1.getUserVehicles);
router
    .route("/:userId/reserve-and-add-vehicle")
    .post(utils_1.authenticateToken, utils_1.userValidation, userController_1.reserveParkingZoneAddVehicle);
router
    .route("/:userId/vehicles/:vehicleId")
    .patch(utils_1.authenticateToken, utils_1.userValidation, userController_1.editVehicle)
    .delete(utils_1.authenticateToken, utils_1.userValidation, userController_1.deleteVehicle);
exports.default = router;
