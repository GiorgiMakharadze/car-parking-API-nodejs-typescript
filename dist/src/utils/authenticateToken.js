"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const http_status_codes_1 = require("http-status-codes");
const paseto_1 = require("paseto");
const crypto_1 = __importDefault(require("crypto"));
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const authController_1 = require("../controllers/authController");
/**
 * Middleware to authenticate token present in cookies.
 * - Validates if token is present.
 * - Verifies the token using paseto.
 * - Checks if the user associated with the token exists.
 * - Validates the checksum to ensure data integrity.
 * - Assigns the user ID to the request object for downstream use.
 * @param req - CustomRequest object containing possibly userId.
 * @param res - Response object used to send response.
 * @param next - NextFunction to pass control to the next middleware.
 */
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Token not provided" });
    }
    const payload = (await paseto_1.V2.verify(token, authController_1.publicKeyPEM));
    const user = await userAuthRepo_1.default.findById(payload.userId);
    if (!user) {
        console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "User does not exist" });
    }
    const stableFields = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    const currentChecksum = crypto_1.default
        .createHash("sha256")
        .update(JSON.stringify(stableFields))
        .digest("hex");
    if (payload.checksum !== currentChecksum) {
        console.warn(`Data alteration detected from IP: ${req.ip} for user: ${user.username}`);
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Data has been altered" });
    }
    req.userId = user.id;
    next();
};
exports.authenticateToken = authenticateToken;
