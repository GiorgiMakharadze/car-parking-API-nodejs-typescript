"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveParkingZone = exports.getUserVehicles = exports.deleteVehicle = exports.editVehicle = exports.addVehicle = void 0;
const http_status_codes_1 = require("http-status-codes");
const userRepo_1 = __importDefault(require("../repos/userRepo"));
const utils_1 = require("../utils");
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const adminRepo_1 = __importDefault(require("../repos/adminRepo"));
const addVehicle = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { name, stateNumber, type } = req.body;
    (0, utils_1.validateVehicleInput)(name, stateNumber, type);
    const newVehicle = await userRepo_1.default.addVehicle(userId, name, stateNumber, type);
    res.status(http_status_codes_1.StatusCodes.CREATED).json(newVehicle);
};
exports.addVehicle = addVehicle;
const editVehicle = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const vehicleId = parseInt(req.params.vehicleId);
    const { name, stateNumber, type } = req.body;
    (0, utils_1.validateVehicleInput)(name, stateNumber, type);
    const vehicle = await userRepo_1.default.findVehicleById(vehicleId);
    if (!vehicle) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: "Vehicle not found" });
    }
    if (parseInt(vehicle.userId) !== userId) {
        return res
            .status(http_status_codes_1.StatusCodes.FORBIDDEN)
            .json({ msg: "Unauthorized action" });
    }
    const updatedVehicle = await userRepo_1.default.editVehicle(vehicleId, name, stateNumber, type);
    res.status(http_status_codes_1.StatusCodes.OK).json(updatedVehicle);
};
exports.editVehicle = editVehicle;
const deleteVehicle = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const vehicleId = parseInt(req.params.vehicleId);
    const vehicle = await userRepo_1.default.findVehicleById(vehicleId);
    if (!vehicle) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: "Vehicle not found" });
    }
    if (parseInt(vehicle.userId) !== userId) {
        return res
            .status(http_status_codes_1.StatusCodes.FORBIDDEN)
            .json({ msg: "Unauthorized action" });
    }
    await userRepo_1.default.deleteVehicle(vehicleId);
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Vehicle deleted" });
};
exports.deleteVehicle = deleteVehicle;
const getUserVehicles = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (parseInt(req.userId) !== userId) {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ msg: "Unauthorized" });
    }
    const user = await userAuthRepo_1.default.findById(userId);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }
    const vehicles = await userRepo_1.default.getUserVehicles(userId);
    res.status(http_status_codes_1.StatusCodes.OK).json(vehicles);
};
exports.getUserVehicles = getUserVehicles;
const reserveParkingZone = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { parkingZoneId, vehicleId, hours } = req.body;
    const parkingZone = await adminRepo_1.default.findParkingZoneById(parkingZoneId);
    if (!parkingZone) {
        return res
            .status(http_status_codes_1.StatusCodes.NOT_FOUND)
            .json({ msg: "Parking Zone not found" });
    }
    const userBalance = 100;
    const cost = parkingZone.hourlyCost * hours;
    if (userBalance < cost) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Insufficient balance" });
    }
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);
    await userRepo_1.default.addParkingHistory(userId, vehicleId, parkingZoneId, endTime, cost);
    console.log("UserId:", userId);
    console.log("Body:", req.body);
    const newBalance = userBalance - cost;
    await userRepo_1.default.updateBalance(userId, newBalance);
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Reservation successful", endTime });
};
exports.reserveParkingZone = reserveParkingZone;
