"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userReservations = exports.getReservation = exports.deleteReservation = exports.reserveParkingZone = exports.getUserVehicles = exports.deleteVehicle = exports.editVehicle = exports.addVehicle = void 0;
const http_status_codes_1 = require("http-status-codes");
const userRepo_1 = __importDefault(require("../repos/userRepo"));
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const adminRepo_1 = __importDefault(require("../repos/adminRepo"));
const utils_1 = require("../utils");
const errors_1 = require("../errors");
/**
 * @function addVehicle
 * @description This function is responsible for adding a new vehicle for a user.
 * It validates the input and then adds the vehicle to the user's record in the database.
 * @param {Request} req - Express request object containing vehicle details like name, stateNumber, and type.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const addVehicle = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { name, stateNumber, type } = req.body;
    if (parseInt(req.userId) !== userId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    (0, utils_1.validateVehicleInput)(name, stateNumber, type);
    const newVehicle = await userRepo_1.default.addVehicle(userId, name, stateNumber, type);
    res.status(http_status_codes_1.StatusCodes.CREATED).json(newVehicle);
};
exports.addVehicle = addVehicle;
/**
 * @function getUserVehicles
 * @description This function is responsible for retrieving all vehicles associated with a user.
 * It checks if the user is authorized and exists, then fetches the user's vehicles from the database.
 * @param {Request} req - Express request object containing the user ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const getUserVehicles = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (parseInt(req.userId) !== userId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    const user = await userAuthRepo_1.default.findById(userId);
    if (!user) {
        throw new errors_1.NotFoundError(`No User with id: ${userId}`);
    }
    const vehicles = await userRepo_1.default.getUserVehicles(userId);
    res.status(http_status_codes_1.StatusCodes.OK).json(vehicles);
};
exports.getUserVehicles = getUserVehicles;
/**
 * @function editVehicle
 * @description This function is responsible for editing the details of a user's vehicle.
 * It validates the input, checks if the vehicle exists and belongs to the user, and then updates the vehicle in the database.
 * @param {Request} req - Express request object containing the vehicle details and IDs in params and body.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const editVehicle = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const vehicleId = parseInt(req.params.vehicleId);
    const { name, stateNumber, type } = req.body;
    if (parseInt(req.userId) !== userId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    (0, utils_1.validateVehicleInput)(name, stateNumber, type);
    const vehicle = await (0, utils_1.findVehicle)(vehicleId, userId);
    if (!vehicle) {
        throw new errors_1.NotFoundError(`No Vehicle with id: ${vehicleId}`);
    }
    const updatedVehicle = await userRepo_1.default.editVehicle(vehicleId, name, stateNumber, type);
    res.status(http_status_codes_1.StatusCodes.OK).json(updatedVehicle);
};
exports.editVehicle = editVehicle;
/**
 * @function deleteVehicle
 * @description This function is responsible for deleting a user's vehicle.
 * It checks if the vehicle exists and belongs to the user, and then deletes the vehicle from the database.
 * @param {Request} req - Express request object containing the user ID and vehicle ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const deleteVehicle = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const vehicleId = parseInt(req.params.vehicleId);
    if (parseInt(req.userId) !== userId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    const vehicle = await (0, utils_1.findVehicle)(vehicleId, userId);
    if (!vehicle) {
        throw new errors_1.NotFoundError(`No Vehicle with id: ${vehicleId}`);
    }
    await userRepo_1.default.deleteVehicle(vehicleId);
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Vehicle deleted" });
};
exports.deleteVehicle = deleteVehicle;
/**
 * @function reserveParkingZone
 * @description This function is responsible for reserving a parking zone for a user's vehicle.
 * It validates the input, checks the user's balance, calculates the cost, and then adds the reservation to the parking history in the database.
 * @param {Request} req - Express request object containing reservation details like parkingZoneId, vehicleId, and hours.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const reserveParkingZone = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { parkingZoneId, vehicleId, hours } = req.body;
    if (parseInt(req.userId) !== userId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    const parkingZone = await adminRepo_1.default.findParkingZoneById(parkingZoneId);
    if (!parkingZone) {
        throw new errors_1.NotFoundError(`No Parking zone  with id: ${parkingZoneId}`);
    }
    const reservations = await userRepo_1.default.findReservationsByUserId(userId);
    if (!reservations.length) {
        throw new errors_1.NotFoundError("No reservations found for this user");
    }
    const userBalance = 100;
    const cost = parkingZone.hourlyCost * hours;
    if (userBalance < cost) {
        throw new errors_1.BadRequestError("Insufficient balance");
    }
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours - 4);
    const parkingHistory = await userRepo_1.default.addParkingHistory(userId, vehicleId, parkingZoneId, endTime, cost);
    const newBalance = userBalance - cost;
    await userRepo_1.default.updateBalance(userId, newBalance);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Reservation successful",
        endTime,
        reservationId: parkingHistory.id,
    });
};
exports.reserveParkingZone = reserveParkingZone;
/**
 * @function userReservations
 * @description Retrieve all reservations associated with a user.
 * @param {CustomRequest} req - Express request object with user ID.
 * @param {Response} res - Express response object.
 */
const userReservations = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const currentUserId = req.userId;
    console.log("userId from params:", userId);
    console.log("currentUserId from req:", currentUserId);
    if (parseInt(req.userId) !== userId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    const reservations = await userRepo_1.default.findReservationsByUserId(userId);
    if (!reservations.length) {
        throw new errors_1.NotFoundError("No reservations found for this user");
    }
    res.status(http_status_codes_1.StatusCodes.OK).json(reservations);
};
exports.userReservations = userReservations;
/**
 * @function getReservation
 * @description This function is responsible for retrieving the details of a reservation.
 * It checks if the reservation exists and belongs to the user, and then sends the reservation details back to the client.
 * @param {CustomRequest} req - Express request object containing the reservation ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const getReservation = async (req, res) => {
    const reservationId = parseInt(req.params.reservationId);
    const currentUserId = req.userId;
    const reservation = await userRepo_1.default.findReservationById(reservationId);
    if (!reservation || reservation.userId !== currentUserId) {
        throw new errors_1.NotFoundError("No reservations found for this user");
    }
    if (currentUserId !== reservationId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    res.status(http_status_codes_1.StatusCodes.OK).json(reservation);
};
exports.getReservation = getReservation;
/**
 * @function deleteReservation
 * @description This function is responsible for deleting a reservation.
 * It checks if the reservation exists and belongs to the user, and then deletes the reservation from the database.
 * @param {CustomRequest} req - Express request object containing the reservation ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const deleteReservation = async (req, res) => {
    const reservationId = parseInt(req.params.reservationId);
    const currentUserId = req.userId;
    if (currentUserId !== reservationId) {
        throw new errors_1.UnauthorizedError("Unauthorized");
    }
    const reservation = await userRepo_1.default.findReservationById(reservationId);
    if (!reservation || reservation.userId !== currentUserId) {
        throw new errors_1.NotFoundError("No reservations found for this user");
    }
    await userRepo_1.default.deleteReservation(reservationId);
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Reservation deleted" });
};
exports.deleteReservation = deleteReservation;
