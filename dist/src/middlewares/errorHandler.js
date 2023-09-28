"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const sequelize_1 = require("sequelize");
const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong",
    };
    if (err instanceof sequelize_1.ValidationError) {
        customError.msg = err.errors.map((item) => item.message).join(",");
        customError.statusCode = 400;
    }
    if (err instanceof sequelize_1.DatabaseError &&
        err.message.includes("duplicate key value violates unique constraint")) {
        const fieldName = err.message.split('"')[3];
        customError.msg = `Duplicate value entered for ${fieldName} field, please choose another value`;
        customError.statusCode = 400;
    }
    if (err instanceof sequelize_1.UniqueConstraintError) {
        customError.msg = `Duplicate value entered for ${Object.keys(err.fields)} field, please choose another value`;
        customError.statusCode = 400;
    }
    if (err instanceof sequelize_1.ForeignKeyConstraintError) {
        customError.msg = `Foreign key constraint error - ${err.message}`;
        customError.statusCode = 400;
    }
    if (err instanceof sequelize_1.ForeignKeyConstraintError) {
        customError.msg = `Foreign key constraint error - ${err.message}`;
        customError.statusCode = 400;
    }
    if (err instanceof sequelize_1.DatabaseError) {
        customError.msg = `Database error - ${err.message}`;
        customError.statusCode = 500;
    }
    if (err instanceof sequelize_1.EmptyResultError) {
        customError.msg = `No record found with the specified identifier`;
        customError.statusCode = 404;
    }
    if (err instanceof sequelize_1.ExclusionConstraintError) {
        customError.msg = `Exclusion constraint error - ${err.message}`;
        customError.statusCode = 400;
    }
    if (err instanceof sequelize_1.TimeoutError) {
        customError.msg = `Query execution timed out - ${err.message}`;
        customError.statusCode = 408;
    }
    if (err instanceof sequelize_1.ConnectionError) {
        customError.msg = `Database connection error - ${err.message}`;
        customError.statusCode = 503;
    }
    if (err instanceof sequelize_1.OptimisticLockError) {
        customError.msg = `The record was updated by another user while trying to save. Please reload and try again - ${err.message}`;
        customError.statusCode = 409;
    }
    if (err instanceof sequelize_1.AccessDeniedError) {
        customError.msg = `Database access denied - ${err.message}`;
        customError.statusCode = 403;
    }
    if (err instanceof sequelize_1.HostNotFoundError) {
        customError.msg = `Database host not found - ${err.message}`;
        customError.statusCode = 500;
    }
    if (err instanceof sequelize_1.HostNotReachableError) {
        customError.msg = `Database host not reachable - ${err.message}`;
        customError.statusCode = 500;
    }
    if (err instanceof sequelize_1.InvalidConnectionError) {
        customError.msg = `Invalid database connection - ${err.message}`;
        customError.statusCode = 500;
    }
    if (err instanceof sequelize_1.ConnectionRefusedError) {
        customError.msg = `Database connection refused - ${err.message}`;
        customError.statusCode = 500;
    }
    if (err instanceof sequelize_1.ConnectionTimedOutError) {
        customError.msg = `Database connection timed out - ${err.message}`;
        customError.statusCode = 500;
    }
    return res.status(customError.statusCode).json({ msg: customError.msg });
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
