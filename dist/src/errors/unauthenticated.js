"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthenticatedError = void 0;
const customApi_1 = require("./customApi");
const http_status_codes_1 = require("http-status-codes");
class UnauthenticatedError extends customApi_1.CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
