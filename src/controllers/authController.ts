import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const register = async (req: Request, res: Response) => {
  res.send("register user");
};

export { register };
