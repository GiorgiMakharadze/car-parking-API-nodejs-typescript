import { CustomAPIError } from "./customApi";
import { StatusCodes } from "http-status-codes";

export class NotFoundError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}
