import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
  EmptyResultError,
  ExclusionConstraintError,
  TimeoutError,
  ConnectionError,
  OptimisticLockError,
  AccessDeniedError,
  HostNotFoundError,
  HostNotReachableError,
  InvalidConnectionError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
} from "sequelize";

export const errorHandlerMiddleware = (
  err: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong",
  };

  if (err instanceof ValidationError) {
    customError.msg = err.errors.map((item: any) => item.message).join(",");
    customError.statusCode = 400;
  }

  if (err instanceof UniqueConstraintError) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.fields
    )} field, please choose another value`;
    customError.statusCode = 400;
  }

  if (err instanceof ForeignKeyConstraintError) {
    customError.msg = `Foreign key constraint error - ${err.message}`;
    customError.statusCode = 400;
  }

  if (err instanceof DatabaseError) {
    customError.msg = `Database error - ${err.message}`;
    customError.statusCode = 500;
  }

  if (err instanceof EmptyResultError) {
    customError.msg = `No record found with the specified identifier`;
    customError.statusCode = 404;
  }

  if (err instanceof ExclusionConstraintError) {
    customError.msg = `Exclusion constraint error - ${err.message}`;
    customError.statusCode = 400;
  }

  if (err instanceof TimeoutError) {
    customError.msg = `Query execution timed out - ${err.message}`;
    customError.statusCode = 408;
  }

  if (err instanceof ConnectionError) {
    customError.msg = `Database connection error - ${err.message}`;
    customError.statusCode = 503;
  }

  if (err instanceof OptimisticLockError) {
    customError.msg = `The record was updated by another user while trying to save. Please reload and try again - ${err.message}`;
    customError.statusCode = 409;
  }

  if (err instanceof AccessDeniedError) {
    customError.msg = `Database access denied - ${err.message}`;
    customError.statusCode = 403;
  }

  if (err instanceof HostNotFoundError) {
    customError.msg = `Database host not found - ${err.message}`;
    customError.statusCode = 500;
  }

  if (err instanceof HostNotReachableError) {
    customError.msg = `Database host not reachable - ${err.message}`;
    customError.statusCode = 500;
  }

  if (err instanceof InvalidConnectionError) {
    customError.msg = `Invalid database connection - ${err.message}`;
    customError.statusCode = 500;
  }

  if (err instanceof ConnectionRefusedError) {
    customError.msg = `Database connection refused - ${err.message}`;
    customError.statusCode = 500;
  }

  if (err instanceof ConnectionTimedOutError) {
    customError.msg = `Database connection timed out - ${err.message}`;
    customError.statusCode = 500;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};
