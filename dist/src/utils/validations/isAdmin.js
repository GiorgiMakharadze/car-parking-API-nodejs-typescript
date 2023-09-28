"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const userAuthRepo_1 = __importDefault(require("../../repos/userAuthRepo"));
const errors_1 = require("../../errors");
const isAdmin = async (userId, res) => {
    const authenticatedUser = await userAuthRepo_1.default.findById(userId);
    if (!authenticatedUser || authenticatedUser.role !== "admin") {
        throw new errors_1.UnauthorizedError("Permission denied");
    }
    return true;
};
exports.isAdmin = isAdmin;
