import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: number | any;
}

export interface PayloadType {
  userId: number;
  checksum: string;
}
