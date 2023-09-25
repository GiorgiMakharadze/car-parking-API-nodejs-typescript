import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userRepo";
import { CustomRequest } from "../types/RequestTypes";

export const adminValidation = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (typeof req.userId === "undefined") {
      console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Unauthorized access" });
    }

    const user = await UserRepo.findById(req.userId);

    if (!user) {
      console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Unauthorized access" });
    }

    const adminRoles = ["admin"];
    if (!adminRoles.includes(user.role)) {
      console.warn(
        `Forbidden access attempt detected from IP: ${req.ip} for user: ${user.username}`
      );
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "Forbidden: Insufficient privileges" });
    }

    next();
  },
];
