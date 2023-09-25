import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import validator from "validator";
import { V2 as paseto } from "paseto";
import { generateKeyPairSync } from "crypto";
import crypto from "crypto";
import "dotenv/config";
import UserRepo from "../repos/userAuthRepo";
import { passwordStrength } from "../utils/passwordStrenght";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const privateKeyPEM = privateKey.export({ type: "pkcs8", format: "pem" });
if (!privateKeyPEM) {
  throw new Error("Private key is not set");
}
export const publicKeyPEM = publicKey.export({ type: "spki", format: "pem" });

const MAX_LOGIN_ATTEMPTS =
  parseInt(process.env.MAX_LOGIN_ATTEMPTS as string) || 3;

/**
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
 * @description logIn - Authenticates a user by verifying their credentials.
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

  res.cookie("token", token, {
    expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({ token });
};

/**
 * @description resetPassword - Allows the user to reset their password.
 * It validates the input, verifies the user's security answer, and then updates the password in the database.
 * Also, it resets the failed login attempts.
 * @param {Request} req - Express request object containing email, security answer, and new password.
 * @param {Response} res - Express response object used to send the response back to the client.
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

  // Add the checksum update code here
  const updatedUser = await UserRepo.findById(user.id); // Fetch the updated user data
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
 * @description refreshTokenHandler - Handles the refresh token to provide a new access token.
 * It verifies the validity of the refresh token, and if valid, invalidates the old refresh token,
 * generates a new access token and a new refresh token, then sends them to the client.
 * @param {Request} req - Express request object containing the refresh token in cookies.
 * @param {Response} res - Express response object used to send the response back to the client.
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

  res.cookie("refreshToken", newRefreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.cookie("token", newAccessToken, {
    expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({ token: newAccessToken });
};

/**
 * @description logOut - This function is responsible for logging out a user securely.
 * It starts by checking the presence of a refresh token in the cookies. If no refresh token is found,
 * it responds with a bad request status, indicating that no refresh token was provided.
 * If a refresh token is present, it attempts to find a user associated with that token.
 * If no user is found, it responds with an unauthorized status, signaling an invalid refresh token.
 * If a valid user is found, it proceeds to invalidate the refresh token in the database, ensuring
 * that it can't be used to generate new access tokens in the future.
 * Lastly, it clears the token and refresh token cookies, and sends a response back to the client
 * indicating that the user has been logged out successfully.
 * @param {Request} req - Express request object containing the refresh token in cookies.
 * @param {Response} res - Express response object used to send the response back to the client.
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

  return res.status(StatusCodes.OK).json({ msg: "Logged out successfully" });
};

export { register, logIn, logOut, resetPassword, refreshTokenHandler };
