import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import UserRepo from "../repos/userRepo";

const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserRepo.findAllUsers();
  const sanitizedUsers = users.map((user) => {
    const {
      password,
      refreshToken,
      checksum,
      securityQuestion,
      securityAnswer,
      ...sanitizedUser
    } = user;
    return sanitizedUser;
  });
  res.status(StatusCodes.OK).json(sanitizedUsers);
};

const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const user = await UserRepo.findById(userId);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
  }

  const {
    password,
    refreshToken,
    checksum,
    securityQuestion,
    securityAnswer,
    ...sanitizedUser
  } = user;

  res.status(StatusCodes.OK).json(sanitizedUser);
};

export { getAllUsers, getUserById };
