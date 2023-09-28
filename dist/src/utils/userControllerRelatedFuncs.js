"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findReservation = exports.findVehicle = void 0;
const userRepo_1 = __importDefault(require("../repos/userRepo"));
const findVehicle = async (vehicleId, userId) => {
    const vehicle = await userRepo_1.default.findVehicleById(vehicleId);
    if (!vehicle || parseInt(vehicle.userId) !== userId) {
        return null;
    }
    return vehicle;
};
exports.findVehicle = findVehicle;
const findReservation = async (reservationId, userId) => {
    const reservation = await userRepo_1.default.findReservationById(reservationId);
    if (!reservation || reservation.userId !== userId) {
        return null;
    }
    return reservation;
};
exports.findReservation = findReservation;
