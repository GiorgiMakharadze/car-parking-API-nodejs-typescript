import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import validator from "validator";
import { V2 as paseto } from "paseto";
import { generateKeyPairSync } from "crypto";
import crypto from "crypto";
import "dotenv/config";
import UserRepo from "../repos/userAuthRepo";
import { passwordStrength, setCookies } from "../utils";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const privateKeyPEM = privateKey.export({
  type: "pkcs8",
  format: "pem",
}) as string;
export const publicKeyPEM = publicKey.export({ type: "spki", format: "pem" });

const MAX_LOGIN_ATTEMPTS =
  parseInt(process.env.MAX_LOGIN_ATTEMPTS as string) || 3;

/**
 * @function register
 * @description register - This function is responsible for registering a new user.
 * It first validates the input, checks if the user already exists, and then creates a new user in the database.
 * If the user is the first to register, they are assigned the role of admin, otherwise, they get a user role.
 * @param {Request} req - Express request object containing user details like username, email, password, security question and answer.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const register = async (req: Request, res: Response) => {
  const { username, email, password, securityQuestion, securityAnswer } =
    req.body;

  if (!username || !validator.isEmail(email) || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid input" });
  }

  if (!passwordStrength(password)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Weak password. It should be at least 10 characters long, contain a number and a special character.",
    });
  }

  const existingUser = await UserRepo.findByEmail(email);
  if (existingUser) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "User already exists" });
  }

  if (!securityQuestion || !securityAnswer) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Security question and answer are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  let role = "user";

  const totalUsers = await UserRepo.countUsers();
  if (totalUsers === 0) {
    role = "admin";
  }

  const user = await UserRepo.createUser(
    username,
    email,
    hashedPassword,
    securityQuestion,
    securityAnswer,
    role
  );

  res.status(StatusCodes.CREATED).json(user);
};

/**
 * @function logIn
 * @description Authenticates a user by verifying their credentials.
 * It checks the number of failed login attempts and if it exceeds the maximum limit, the account is suspended.
 * If the credentials are valid, it resets the failed login attempts, creates a checksum of the user data, generates a token,
 * and a refresh token, then sends them to the client.
 * @param {Request} req - Express request object containing user credentials - email and password.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const logIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!validator.isEmail(email) || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid input" });
  }

  const user = await UserRepo.findByEmail(email);
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid credentials" });
  }

  if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Your account is suspended. Please reset your password." });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    await UserRepo.incrementFailedLoginAttempts(user.id);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid credentials" });
  }

  await UserRepo.resetFailedLoginAttempts(user.id);

  const checksumData = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  const checksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(checksumData))
    .digest("hex");
  await UserRepo.updateChecksum(user.id, checksum);

  const token = await paseto.sign({ userId: user.id, checksum }, privateKeyPEM);
  const refreshToken = crypto.randomBytes(64).toString("hex");
  await UserRepo.saveRefreshToken(user.id, refreshToken);

  setCookies(res, token, refreshToken);

  res.status(StatusCodes.OK).json({ token });
};

/**
 * @function resetPassword
 * @description Allows a user to reset their password after validating input and verifying security answer.
 * Updates the password and resets failed login attempts upon successful verification.
 * @param {Request} req - Contains email, security answer, and new password.
 * @param {Response} res - Used to send the response back to the client.
 */
const resetPassword = async (req: Request, res: Response) => {
  const { email, securityAnswer, newPassword } = req.body;

  if (!email || !securityAnswer || !newPassword) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid input" });
  }

  if (!passwordStrength(newPassword)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Weak password. It should be at least 10 characters long, contain a number and a special character.",
    });
  }

  const user = await UserRepo.findByEmail(email);
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
  }

  if (user.securityAnswer !== securityAnswer) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid security answer" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await UserRepo.updatePassword(user.id, hashedPassword);
  await UserRepo.resetFailedLoginAttempts(user.id);

  const updatedUser = await UserRepo.findById(user.id);
  const updatedChecksumData = {
    id: updatedUser?.id,
    username: updatedUser?.username,
    email: updatedUser?.email,
  };
  const updatedChecksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(updatedChecksumData))
    .digest("hex");
  await UserRepo.updateChecksum(user.id, updatedChecksum);

  res.status(StatusCodes.OK).json({ msg: "Password reset successfully" });
};

/**
 * @function refreshTokenHandler
 * @description Verifies and refreshes tokens.
 * If the provided refresh token is valid, it invalidates the old token, generates new tokens, and sends them to the client.
 * @param {Request} req - Contains the refresh token in cookies.
 * @param {Response} res - Used to send the response back to the client.
 */
const refreshTokenHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "No refresh token provided" });
  }

  const user = await UserRepo.findByRefreshToken(refreshToken);
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid refresh token" });
  }

  if (new Date() > user.refreshTokenExpiresAt) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Refresh token has expired" });
  }

  await UserRepo.saveRefreshToken(user.id, null);

  const checksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(user))
    .digest("hex");
  const newAccessToken = await paseto.sign(
    { userId: user.id, checksum },
    privateKeyPEM
  );
  const newRefreshToken = crypto.randomBytes(64).toString("hex");

  await UserRepo.saveRefreshToken(user.id, newRefreshToken);

  setCookies(res, newAccessToken, newRefreshToken);

  res.status(StatusCodes.OK).json({ token: newAccessToken });
};

/**
 * @function logOut
 * @description Logs out a user securely by invalidating the refresh token and clearing cookies.
 * @param {Request} req - Contains the refresh token in cookies.
 * @param {Response} res - Used to send the response back to the client, indicating successful logout.
 */
const logOut = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "No refresh token provided" });
  }

  const user = await UserRepo.findByRefreshToken(refreshToken);
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid refresh token" });
  }

  await UserRepo.invalidateRefreshToken(user.id);

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.clearCookie("_csrf");

  return res.status(StatusCodes.OK).json({ msg: "Logged out successfully" });
};

export { register, logIn, logOut, resetPassword, refreshTokenHandler };
