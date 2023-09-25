import { Response } from "express";

export const setCookies = (
  res: Response,
  token: string,
  refreshToken: string
) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
    secure: isProduction,
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: isProduction,
    httpOnly: true,
  });
};
