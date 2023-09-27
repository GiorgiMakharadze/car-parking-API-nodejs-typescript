"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewParkingHistory = exports.deleteParkingZone = exports.updateParkingZone = exports.getParkingZoneById = exports.getAllParkingZones = exports.createParkingZone = exports.makeUserAdmin = exports.deleteUser = exports.getUserById = exports.getAllUsers = void 0;
const http_status_codes_1 = require("http-status-codes");
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const adminRepo_1 = __importDefault(require("../repos/adminRepo"));
const utils_1 = require("../utils");
/**
 * @function getAllUsers
 * @description Retrieve all users from the database and sanitize the output.
 * This function is responsible for fetching all user details, removing sensitive information,
 * and returning sanitized user objects.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object used to send the sanitized user details back to the client.
 */
const getAllUsers = async (req, res) => {
    const users = await userAuthRepo_1.default.findAllUsers();
    const sanitizedUsers = users.map((user) => {
        const { password, refreshToken, checksum, securityQuestion, securityAnswer } = user, sanitizedUser = __rest(user, ["password", "refreshToken", "checksum", "securityQuestion", "securityAnswer"]);
        return sanitizedUser;
    });
    res.status(http_status_codes_1.StatusCodes.OK).json(sanitizedUsers);
};
exports.getAllUsers = getAllUsers;
/**
 * @function getUserById
 * @description Fetch a user by ID, sanitize and return the user object.
 * This function retrieves a user based on the provided user ID, removes sensitive information,
 * and sends the sanitized user object as a response.
 * @param {Request} req - Express request object with user ID in parameters.
 * @param {Response} res - Express response object used to send the sanitized user details back to the client.
 */
const getUserById = async (req, res) => {
    const userId = req.params.id;
    const user = await userAuthRepo_1.default.findById(userId);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }
    const { password, refreshToken, checksum, securityQuestion, securityAnswer } = user, sanitizedUser = __rest(user, ["password", "refreshToken", "checksum", "securityQuestion", "securityAnswer"]);
    res.status(http_status_codes_1.StatusCodes.OK).json(sanitizedUser);
};
exports.getUserById = getUserById;
const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const deletedUser = await adminRepo_1.default.deleteUser(userId);
    if (!deletedUser) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: `User with id ${userId} is deleted` });
};
exports.deleteUser = deleteUser;
const makeUserAdmin = async (req, res) => {
    const { id } = req.params;
    const userId = id;
    const authenticatedUser = await userAuthRepo_1.default.findById(req.userId);
    if (!authenticatedUser || authenticatedUser.role !== "admin") {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ msg: "Permission denied" });
    }
    const user = await userAuthRepo_1.default.findById(userId);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }
    if (user.role === "admin") {
        return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "User is already an admin" });
    }
    await adminRepo_1.default.grantAdminRights(userId);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "User has been made admin" });
};
exports.makeUserAdmin = makeUserAdmin;
/**
 * @function createParkingZone
 * @description Validate input and create a new parking zone.
 * This function validates the parking zone input, checks if a parking zone with the same name already exists,
 * and if not, creates a new parking zone and returns its details.
 * @param {Request} req - Express request object containing parking zone details like name, address, and hourly cost.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const createParkingZone = async (req, res) => {
    const { name, address, hourlyCost } = req.body;
    (0, utils_1.validateParkingZoneInput)(name, address, hourlyCost);
    const existingZone = await adminRepo_1.default.findParkingZoneByName(name);
    if (existingZone) {
        return res
            .status(http_status_codes_1.StatusCodes.CONFLICT)
            .json({ msg: "Parking zone already exists" });
    }
    const newParkingZone = await adminRepo_1.default.createParkingZone(name, address, hourlyCost);
    res.status(http_status_codes_1.StatusCodes.CREATED).json(newParkingZone);
};
exports.createParkingZone = createParkingZone;
/**
 * @function getAllParkingZones
 * @description Retrieve and return all parking zones from the database.
 * This function fetches and sends back all parking zones stored in the database.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object used to send the parking zones details back to the client.
 */
const getAllParkingZones = async (_req, res) => {
    const parkingZones = await adminRepo_1.default.findAllParkingZones();
    res.status(http_status_codes_1.StatusCodes.OK).json(parkingZones);
};
exports.getAllParkingZones = getAllParkingZones;
/**
 * @function getParkingZoneById
 * @description Fetch and return the parking zone by ID.
 * This function validates if the parking zone with the given ID exists, retrieves it,
 * and returns its details.
 * @param {Request} req - Express request object with parking zone ID in parameters.
 * @param {Response} res - Express response object used to send the parking zone details back to the client.
 */
const getParkingZoneById = async (req, res) => {
    const zoneId = parseInt(req.params.id);
    await (0, utils_1.validateParkingZoneExistence)(zoneId);
    const parkingZone = await adminRepo_1.default.findParkingZoneById(zoneId);
    res.status(http_status_codes_1.StatusCodes.OK).json(parkingZone);
};
exports.getParkingZoneById = getParkingZoneById;
/**
 * @function updateParkingZone
 * @description Validate input, check the existence of the parking zone and update its details.
 * This function validates the parking zone input, ensures the parking zone with the given ID exists,
 * updates its details, and returns the updated parking zone.
 * @param {Request} req - Express request object containing updated parking zone details and ID in parameters.
 * @param {Response} res - Express response object used to send the updated parking zone details back to the client.
 */
const updateParkingZone = async (req, res) => {
    const zoneId = parseInt(req.params.id);
    const { name, address, hourlyCost } = req.body;
    (0, utils_1.validateParkingZoneInput)(name, address, hourlyCost);
    await (0, utils_1.validateParkingZoneExistence)(zoneId);
    const updatedParkingZone = await adminRepo_1.default.updateParkingZone(zoneId, name, address, hourlyCost);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: `Parking zone with id ${zoneId} is updated`,
        updatedParkingZone,
    });
};
exports.updateParkingZone = updateParkingZone;
/**
 * @function deleteParkingZone
 * @description Validate the existence of the parking zone and delete it.
 * This function checks if the parking zone with the given ID exists and deletes it, returning a confirmation message.
 * @param {Request} req - Express request object with parking zone ID in parameters.
 * @param {Response} res - Express response object used to send a confirmation of deletion back to the client.
 */
const deleteParkingZone = async (req, res) => {
    const zoneId = parseInt(req.params.id);
    await (0, utils_1.validateParkingZoneExistence)(zoneId);
    await adminRepo_1.default.deleteParkingZone(zoneId);
    res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ msg: `Parking zone wit id ${zoneId} is deleted` });
};
exports.deleteParkingZone = deleteParkingZone;
const viewParkingHistory = async (_req, res) => {
    const parkingHistories = await adminRepo_1.default.findAllParkingHistories();
    res.status(http_status_codes_1.StatusCodes.OK).json(parkingHistories);
};
exports.viewParkingHistory = viewParkingHistory;
