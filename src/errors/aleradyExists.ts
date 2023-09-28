import { CustomAPIError } from "./customApi";
import { StatusCodes } from "http-status-codes";

export class AlreadyExistsError extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}
