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
exports.getAllUsers = void 0;
const http_status_codes_1 = require("http-status-codes");
require("dotenv/config");
const userRepo_1 = __importDefault(require("../repos/userRepo"));
const getAllUsers = async (req, res) => {
    const users = await userRepo_1.default.findAllUsers();
    const sanitizedUsers = users.map((user) => {
        const { password, refreshToken, checksum, securityQuestion, securityAnswer } = user, sanitizedUser = __rest(user, ["password", "refreshToken", "checksum", "securityQuestion", "securityAnswer"]);
        return sanitizedUser;
    });
    res.status(http_status_codes_1.StatusCodes.OK).json(sanitizedUsers);
};
exports.getAllUsers = getAllUsers;
