"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenHandler = exports.resetPassword = exports.logOut = exports.logIn = exports.register = exports.publicKeyPEM = void 0;
const http_status_codes_1 = require("http-status-codes");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const paseto_1 = require("paseto");
const crypto_1 = require("crypto");
const crypto_2 = __importDefault(require("crypto"));
require("dotenv/config");
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const utils_1 = require("../utils");
const { privateKey, publicKey } = (0, crypto_1.generateKeyPairSync)("ed25519");
const privateKeyPEM = privateKey.export({
    type: "pkcs8",
    format: "pem",
});
exports.publicKeyPEM = publicKey.export({ type: "spki", format: "pem" });
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
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Username is required" });
    }
    if (!email || !validator_1.default.isEmail(email)) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Valid email is required" });
    }
    if (!password) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Password is required" });
    }
    if (!(0, utils_1.passwordStrength)(password)) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            msg: "Weak password. It should be at least 10 characters long, contain a number and a special character.",
        });
    }
    const existingUser = await userAuthRepo_1.default.findByEmail(email);
    if (existingUser) {
        return res
            .status(http_status_codes_1.StatusCodes.CONFLICT)
            .json({ msg: "User already exists" });
    }
    if (!securityQuestion || !securityAnswer) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Security question and answer are required" });
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
    if (!email) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Email is required" });
    }
    if (!validator_1.default.isEmail(email)) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Invalid email format" });
    }
    if (!password) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Password is required" });
    }
    const user = await userAuthRepo_1.default.findByEmail(email);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ msg: "User not found" });
    }
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        return res
            .status(http_status_codes_1.StatusCodes.FORBIDDEN)
            .json({ msg: "Your account is suspended. Please reset your password." });
    }
    const isValidPassword = await bcrypt_1.default.compare(password, user.password);
    if (!isValidPassword) {
        await userAuthRepo_1.default.incrementFailedLoginAttempts(user.id);
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Invalid credentials" });
    }
    await userAuthRepo_1.default.resetFailedLoginAttempts(user.id);
    const checksumData = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    const checksum = crypto_2.default
        .createHash("sha256")
        .update(JSON.stringify(checksumData))
        .digest("hex");
    await userAuthRepo_1.default.updateChecksum(user.id, checksum);
    const token = await paseto_1.V2.sign({ userId: user.id, checksum }, privateKeyPEM);
    const refreshToken = crypto_2.default.randomBytes(64).toString("hex");
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
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Email is required" });
    }
    if (!securityAnswer) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "Security answer is required" });
    }
    if (!newPassword) {
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "New password is required" });
    }
    if (!(0, utils_1.passwordStrength)(newPassword)) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            msg: "Weak password. It should be at least 10 characters long, contain a number and a special character.",
        });
    }
    const user = await userAuthRepo_1.default.findByEmail(email);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }
    if (user.securityAnswer !== securityAnswer) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Invalid security answer" });
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
    await userAuthRepo_1.default.updatePassword(user.id, hashedPassword);
    await userAuthRepo_1.default.resetFailedLoginAttempts(user.id);
    const updatedUser = await userAuthRepo_1.default.findById(user.id);
    const updatedChecksumData = {
        id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.id,
        username: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.username,
        email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
    };
    const updatedChecksum = crypto_2.default
        .createHash("sha256")
        .update(JSON.stringify(updatedChecksumData))
        .digest("hex");
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
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "No refresh token provided" });
    }
    const user = await userAuthRepo_1.default.findByRefreshToken(refreshToken);
    if (!user) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Invalid refresh token" });
    }
    if (new Date() > user.refreshTokenExpiresAt) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Refresh token has expired" });
    }
    await userAuthRepo_1.default.saveRefreshToken(user.id, null);
    const checksum = crypto_2.default
        .createHash("sha256")
        .update(JSON.stringify(user))
        .digest("hex");
    const newAccessToken = await paseto_1.V2.sign({ userId: user.id, checksum }, privateKeyPEM);
    const newRefreshToken = crypto_2.default.randomBytes(64).toString("hex");
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
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .json({ msg: "No refresh token provided" });
    }
    const user = await userAuthRepo_1.default.findByRefreshToken(refreshToken);
    if (!user) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Invalid refresh token" });
    }
    await userAuthRepo_1.default.invalidateRefreshToken(user.id);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.clearCookie("_csrf");
    return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Logged out successfully" });
};
exports.logOut = logOut;
