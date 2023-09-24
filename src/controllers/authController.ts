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

const { privateKey } = generateKeyPairSync("ed25519");
const privateKeyPEM = privateKey.export({ type: "pkcs8", format: "pem" });
const MAX_LOGIN_ATTEMPTS =
  parseInt(process.env.MAX_LOGIN_ATTEMPTS as string) || 3;

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

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

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await UserRepo.createUser(username, email, hashedPassword);

  res.status(StatusCodes.CREATED).json(user);
};

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

  const checksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(user))
    .digest("hex");
  await UserRepo.updateChecksum(user.id, checksum);

  const token = await paseto.sign({ userId: user.id, checksum }, privateKeyPEM);

  res.cookie("token", token, {
    expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({ token });
};
export { register, logIn };
