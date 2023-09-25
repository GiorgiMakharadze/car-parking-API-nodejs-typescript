import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: string;
}

export interface PayloadType {
  userId: string;
  checksum: string;
}
