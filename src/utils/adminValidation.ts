import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userAuthRepo";

export const adminValidation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserRepo.findById(req.userId); // Assume `req.userId` is set from the token in previous middleware

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Unauthorized access" });
    }

    if (user.role !== "admin") {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "Forbidden: Only admins are allowed" });
    }

    next();
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Internal Server Error" });
  }
};
