"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVehicleInput = void 0;
const validator_1 = __importDefault(require("validator"));
const validateVehicleInput = (name, stateNumber, type) => {
    if (!validator_1.default.isAlpha(name, "en-US", { ignore: " " })) {
        throw new Error("Invalid vehicle name");
    }
    if (!validator_1.default.isAlphanumeric(stateNumber, "en-US")) {
        throw new Error("Invalid state number");
    }
    if (!["Sedan", "Hatchback", "SUV", "Truck"].includes(type)) {
        throw new Error("Invalid vehicle type");
    }
};
exports.validateVehicleInput = validateVehicleInput;
