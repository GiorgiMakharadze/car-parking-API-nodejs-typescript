"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenHandler = exports.resetPassword = exports.logOut = exports.logIn = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const paseto_1 = require("paseto");
const crypto_1 = __importDefault(require("crypto"));
require("dotenv/config");
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const utils_1 = require("../utils");
const errors_1 = require("../errors");
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 3;
/**
 * @function register
 * @description register - This function is responsible for registering a new user.
 * It first validates the input, checks if the user already exists, and then creates a new user in the database.
 * If the user is the first to register, they are assigned the role of admin, otherwise, they get a user role.
 * @param {Request} req - Express request object containing user details like username, email, password, security question and answer.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const register = async (req, res) => {
    const { username, email, password, securityQuestion, securityAnswer } = req.body;
    if (!username) {
        throw new errors_1.BadRequestError("Please provide username");
    }
    if (!email || !validator_1.default.isEmail(email)) {
        throw new errors_1.BadRequestError("Valid email is required");
    }
    if (!password) {
        throw new errors_1.BadRequestError("Please provide password");
    }
    if (!(0, utils_1.passwordStrength)(password)) {
        throw new errors_1.BadRequestError("Weak password. It should be at least 10 characters long, contain a number and a special character.");
    }
    const existingUser = await userAuthRepo_1.default.findByEmail(email);
    if (existingUser) {
        throw new errors_1.AlreadyExistsError("User already exists");
    }
    if (!securityQuestion || !securityAnswer) {
        throw new errors_1.BadRequestError("Security question and answer are required");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 12);
    let role = "user";
    const totalUsers = await userAuthRepo_1.default.countUsers();
    if (totalUsers === 0) {
        role = "admin";
    }
    const user = await userAuthRepo_1.default.createUser(username, email, hashedPassword, securityQuestion, securityAnswer, role);
    res.status(http_status_codes_1.StatusCodes.CREATED).json(user);
};
exports.register = register;
/**
 * @function logIn
 * @description Authenticates a user by verifying their credentials.
 * It checks the number of failed login attempts and if it exceeds the maximum limit, the account is suspended.
 * If the credentials are valid, it resets the failed login attempts, creates a checksum of the user data, generates a token,
 * and a refresh token, then sends them to the client.
 * @param {Request} req - Express request object containing user credentials - email and password.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const logIn = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !validator_1.default.isEmail(email)) {
        throw new errors_1.BadRequestError("Valid email is required");
    }
    if (!password) {
        throw new errors_1.BadRequestError("Please provide password");
    }
    const user = await userAuthRepo_1.default.findByEmail(email);
    if (!user) {
        throw new errors_1.UnauthenticatedError("User not found");
    }
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        throw new errors_1.UnauthorizedError("Your account is suspended. Please reset your password.");
    }
    const isValidPassword = await bcrypt_1.default.compare(password, user.password);
    if (!isValidPassword) {
        await userAuthRepo_1.default.incrementFailedLoginAttempts(user.id);
        throw new errors_1.UnauthenticatedError("Invalid Credentials");
    }
    await userAuthRepo_1.default.resetFailedLoginAttempts(user.id);
    const checksum = (0, utils_1.calculateChecksum)({
        id: user.id,
        username: user.username,
        email: user.email,
    });
    await userAuthRepo_1.default.updateChecksum(user.id, checksum);
    const token = await paseto_1.V2.sign({ userId: user.id, checksum }, utils_1.privateKeyPEM);
    const refreshToken = crypto_1.default.randomBytes(64).toString("hex");
    await userAuthRepo_1.default.saveRefreshToken(user.id, refreshToken);
    (0, utils_1.setCookies)(res, token, refreshToken);
    res.status(http_status_codes_1.StatusCodes.OK).json({ token });
};
exports.logIn = logIn;
/**
 * @function resetPassword
 * @description Allows a user to reset their password after validating input and verifying security answer.
 * Updates the password and resets failed login attempts upon successful verification.
 * @param {Request} req - Contains email, security answer, and new password.
 * @param {Response} res - Used to send the response back to the client.
 */
const resetPassword = async (req, res) => {
    const { email, securityAnswer, newPassword } = req.body;
    if (!email) {
        throw new errors_1.BadRequestError("Please provide email");
    }
    if (!securityAnswer) {
        throw new errors_1.BadRequestError("Please provide security answer");
    }
    if (!newPassword) {
        throw new errors_1.BadRequestError("Please provide new password");
    }
    if (!(0, utils_1.passwordStrength)(newPassword)) {
        throw new errors_1.BadRequestError("Weak password. It should be at least 10 characters long, contain a number and a special character");
    }
    const user = await userAuthRepo_1.default.findByEmail(email);
    if (!user) {
        throw new errors_1.NotFoundError("User not found");
    }
    if (user.securityAnswer !== securityAnswer) {
        throw new errors_1.UnauthenticatedError("Invalid Security answer");
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
    await userAuthRepo_1.default.updatePassword(user.id, hashedPassword);
    await userAuthRepo_1.default.resetFailedLoginAttempts(user.id);
    const updatedUser = await userAuthRepo_1.default.findById(user.id);
    const updatedChecksum = (0, utils_1.calculateChecksum)({
        id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.id,
        username: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.username,
        email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
    });
    await userAuthRepo_1.default.updateChecksum(user.id, updatedChecksum);
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Password reset successfully" });
};
exports.resetPassword = resetPassword;
/**
 * @function refreshTokenHandler
 * @description Verifies and refreshes tokens.
 * If the provided refresh token is valid, it invalidates the old token, generates new tokens, and sends them to the client.
 * @param {Request} req - Contains the refresh token in cookies.
 * @param {Response} res - Used to send the response back to the client.
 */
const refreshTokenHandler = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new errors_1.BadRequestError("No refresh token provided");
    }
    const user = await userAuthRepo_1.default.findByRefreshToken(refreshToken);
    if (!user) {
        throw new errors_1.UnauthenticatedError("Invalid refresh token");
    }
    if (new Date() > user.refreshTokenExpiresAt) {
        throw new errors_1.UnauthenticatedError("Refresh token has expired");
    }
    const checksum = (0, utils_1.calculateChecksum)({
        id: user.id,
        username: user.username,
        email: user.email,
    });
    const newAccessToken = await paseto_1.V2.sign({ userId: user.id, checksum }, utils_1.privateKeyPEM);
    const newRefreshToken = crypto_1.default.randomBytes(64).toString("hex");
    await userAuthRepo_1.default.saveRefreshToken(user.id, newRefreshToken);
    (0, utils_1.setCookies)(res, newAccessToken, newRefreshToken);
    res.status(http_status_codes_1.StatusCodes.OK).json({ token: newAccessToken });
};
exports.refreshTokenHandler = refreshTokenHandler;
/**
 * @function logOut
 * @description Logs out a user securely by invalidating the refresh token and clearing cookies.
 * @param {Request} req - Contains the refresh token in cookies.
 * @param {Response} res - Used to send the response back to the client, indicating successful logout.
 */
const logOut = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new errors_1.BadRequestError("No refresh token provided");
    }
    const user = await userAuthRepo_1.default.findByRefreshToken(refreshToken);
    if (!user) {
        throw new errors_1.UnauthenticatedError("Invalid refresh token");
    }
    await userAuthRepo_1.default.invalidateRefreshToken(user.id);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.clearCookie("_csrf");
    return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Logged out successfully" });
};
exports.logOut = logOut;
