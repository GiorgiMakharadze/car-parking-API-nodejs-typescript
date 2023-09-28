"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateChecksum = void 0;
const crypto_1 = __importDefault(require("crypto"));
const calculateChecksum = (user) => {
    const checksumData = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    return crypto_1.default
        .createHash("sha256")
        .update(JSON.stringify(checksumData))
        .digest("hex");
};
exports.calculateChecksum = calculateChecksum;
