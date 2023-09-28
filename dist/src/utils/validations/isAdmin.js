"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const http_status_codes_1 = require("http-status-codes");
const userAuthRepo_1 = __importDefault(require("../../repos/userAuthRepo"));
const isAdmin = async (userId, res) => {
    const authenticatedUser = await userAuthRepo_1.default.findById(userId);
    if (!authenticatedUser || authenticatedUser.role !== "admin") {
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ msg: "Permission denied" });
        return false;
    }
    return true;
};
exports.isAdmin = isAdmin;
