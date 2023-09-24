import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import "dotenv/config";

const testFuncntion = async (req: Request, res: Response) => {
  res.status(200).json({ msg: "you are admin" });
};

export { testFuncntion };
