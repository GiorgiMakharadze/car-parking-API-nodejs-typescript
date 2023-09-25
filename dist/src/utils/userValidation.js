"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const http_status_codes_1 = require("http-status-codes");
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const userValidation = async (req, res, next) => {
    try {
        const user = await userAuthRepo_1.default.findById(req.userId); // Now using the findById method
        if (!user) {
            return res
                .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                .json({ msg: "Unauthorized access" });
        }
        if (user.role !== "user") {
            return res
                .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                .json({ msg: "Forbidden: Only users are allowed" });
        }
        next();
    }
    catch (error) {
        return res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal Server Error" });
    }
};
exports.userValidation = userValidation;
