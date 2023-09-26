import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { V2 as paseto } from "paseto";
import crypto from "crypto";
import UserRepo from "../../repos/userAuthRepo";
import { publicKeyPEM } from "../../controllers/authController";
import { CustomRequest, PayloadType } from "../../types/RequestTypes";

/**
 * Middleware to authenticate token present in cookies.
 * - Validates if token is present.
 * - Verifies the token using paseto.
 * - Checks if the user associated with the token exists.
 * - Validates the checksum to ensure data integrity.
 * - Assigns the user ID to the request object for downstream use.
 * @param req - CustomRequest object containing possibly userId.
 * @param res - Response object used to send response.
 * @param next - NextFunction to pass control to the next middleware.
 */
export const authenticateToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Token not provided" });
  }

  const payload = (await paseto.verify(token, publicKeyPEM)) as PayloadType;

  const user = await UserRepo.findById(payload.userId);
  if (!user) {
    console.warn(`Unauthorized access attempt detected from IP: ${req.ip}`);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "User does not exist" });
  }

  const stableFields = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  const currentChecksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(stableFields))
    .digest("hex");

  if (payload.checksum !== currentChecksum) {
    console.warn(
      `Data alteration detected from IP: ${req.ip} for user: ${user.username}`
    );
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Data has been altered" });
  }

  req.userId = user.id;
  next();
};
