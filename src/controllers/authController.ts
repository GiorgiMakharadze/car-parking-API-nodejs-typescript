import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import validator from "validator";
import { V2 as paseto } from "paseto";
import { randomBytes } from "crypto";
import UserRepo from "../repos/userAuthRepo";
import { passwordStrength } from "../utils/passwordStrenght";

const privateKey = randomBytes(32);

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

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid credentials" });
  }

  const token = await paseto.sign({ userId: user.id }, privateKey);

  res.status(StatusCodes.OK).json({ token });
};
export { register, logIn };
