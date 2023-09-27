import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: number;
}

export interface PayloadType {
  userId: number;
  checksum: string;
}
