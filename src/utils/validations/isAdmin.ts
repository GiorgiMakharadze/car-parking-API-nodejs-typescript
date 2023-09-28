import { Response } from "express";
import AuthUserRepo from "../../repos/userAuthRepo";
import { UnauthorizedError } from "../../errors";

export const isAdmin = async (userId: any, res: Response) => {
  const authenticatedUser = await AuthUserRepo.findById(userId);
  if (!authenticatedUser || authenticatedUser.role !== "admin") {
    throw new UnauthorizedError("Permission denied");
  }
  return true;
};
