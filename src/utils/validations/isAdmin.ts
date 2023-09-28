import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import AuthUserRepo from "../../repos/userAuthRepo";
import { CustomRequest } from "../../types/RequestTypes";

export const isAdmin = async (userId: any, res: Response) => {
  const authenticatedUser = await AuthUserRepo.findById(userId);
  if (!authenticatedUser || authenticatedUser.role !== "admin") {
    res.status(StatusCodes.FORBIDDEN).json({ msg: "Permission denied" });
    return false;
  }
  return true;
};
