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
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Token not provided" });
    }
    try {
        const payload = (await paseto_1.V2.verify(token, authController_1.publicKeyPEM));
        const user = await userAuthRepo_1.default.findById(payload.userId);
        if (!user) {
            return res
                .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                .json({ msg: "User does not exist" });
        }
        console.log("User Object:", JSON.stringify(user));
        // Define stable fields to include in checksum calculation
        const stableFields = {
            id: user.id,
            username: user.username,
            email: user.email,
            // Add other fields that are stable and should be included in checksum calculation
        };
        const currentChecksum = crypto_1.default
            .createHash("sha256")
            .update(JSON.stringify(stableFields))
            .digest("hex");
        console.log("Current Checksum:", currentChecksum);
        if (payload.checksum !== currentChecksum) {
            return res
                .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
                .json({ msg: "Data has been altered" });
        }
        req.userId = user.id;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ msg: "Invalid token" });
    }
};
exports.authenticateToken = authenticateToken;
