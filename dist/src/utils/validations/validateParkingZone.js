"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParkingZoneInput = exports.validateParkingZoneExistence = void 0;
const validator_1 = __importDefault(require("validator"));
const adminRepo_1 = __importDefault(require("../../repos/adminRepo"));
const validateParkingZoneExistence = async (zoneId) => {
    const existingZone = await adminRepo_1.default.findParkingZoneById(zoneId);
    if (!existingZone) {
        throw new Error("Parking zone not found");
    }
};
exports.validateParkingZoneExistence = validateParkingZoneExistence;
const validateParkingZoneInput = (name, address, hourlyCost) => {
    if (!validator_1.default.isAlpha(name, "en-US", { ignore: " " })) {
        throw new Error("Invalid zone name");
    }
    if (typeof address !== "string" || address.trim() === "") {
        throw new Error("Invalid address");
    }
    if (!validator_1.default.isNumeric(String(hourlyCost))) {
        throw new Error("Invalid hourly cost");
    }
};
exports.validateParkingZoneInput = validateParkingZoneInput;
