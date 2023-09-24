"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logIn = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const paseto_1 = require("paseto");
const crypto_1 = require("crypto");
const crypto_2 = __importDefault(require("crypto"));
const userAuthRepo_1 = __importDefault(require("../repos/userAuthRepo"));
const passwordStrenght_1 = require("../utils/passwordStrenght");
const privateKey = (0, crypto_1.randomBytes)(32);
const MAX_LOGIN_ATTEMPTS = 3;
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !validator_1.default.isEmail(email) || !password) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Invalid input" });
    }
    if (!(0, passwordStrenght_1.passwordStrength)(password)) {
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
    const hashedPassword = await bcrypt_1.default.hash(password, 12);
    const user = await userAuthRepo_1.default.createUser(username, email, hashedPassword);
    res.status(http_status_codes_1.StatusCodes.CREATED).json(user);
};
exports.register = register;
const logIn = async (req, res) => {
    const { email, password } = req.body;
    if (!validator_1.default.isEmail(email) || !password) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ msg: "Invalid input" });
    }
    const user = await userAuthRepo_1.default.findByEmail(email);
    if (!user) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ msg: "Invalid credentials" });
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
    // Calculate checksum (For example, using SHA256)
    const checksum = crypto_2.default
        .createHash("sha256")
        .update(JSON.stringify(user))
        .digest("hex");
    await userAuthRepo_1.default.updateChecksum(user.id, checksum);
    const token = await paseto_1.V2.sign({ userId: user.id, checksum }, privateKey);
    res.status(http_status_codes_1.StatusCodes.OK).json({ token });
};
exports.logIn = logIn;
