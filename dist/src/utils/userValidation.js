"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const http_status_codes_1 = require("http-status-codes");
const userRepo_1 = __importDefault(require("../repos/userRepo"));
exports.userValidation = [
    async (req, res, next) => {
        if (typeof req.userId === "undefined") {
            console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
            return res
                .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                .json({ msg: "Unauthorized access" });
        }
        const user = await userRepo_1.default.findById(req.userId);
        if (!user) {
            console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
            return res
                .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                .json({ msg: "Unauthorized access" });
        }
        const userRoles = ["user"];
        if (!userRoles.includes(user.role)) {
            console.warn(`Forbidden access attempt detected from IP: ${req.ip} for user: ${user.username}`);
            return res
                .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                .json({ msg: "Forbidden: Insufficient privileges" });
        }
        next();
    },
];
