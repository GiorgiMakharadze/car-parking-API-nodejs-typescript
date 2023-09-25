import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { V2 as paseto } from "paseto";
import crypto from "crypto";
import UserRepo from "../repos/userAuthRepo";
import { publicKeyPEM } from "../controllers/authController";

interface PayloadType {
  userId: number;
  checksum: string;
}
export const authenticateToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Token not provided" });
  }

  try {
    const payload = (await paseto.verify(token, publicKeyPEM)) as PayloadType;

    const user = await UserRepo.findById(payload.userId);

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "User does not exist" });
    }
    console.log("User Object:", JSON.stringify(user));

    // Define stable fields to include in checksum calculation
    const stableFields = {
      id: user.id,
      username: user.username,
      email: user.email,
      // Add other fields that are stable and should be included in checksum calculation
    };

    const currentChecksum = crypto
      .createHash("sha256")
      .update(JSON.stringify(stableFields))
      .digest("hex");
    console.log("Current Checksum:", currentChecksum);

    if (payload.checksum !== currentChecksum) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Data has been altered" });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid token" });
  }
};
