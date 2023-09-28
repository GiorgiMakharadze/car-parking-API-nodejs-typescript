"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const notFoundMiddleware = (req, res) => res.status(http_status_codes_1.StatusCodes.NOT_FOUND).send("Route does not exist");
exports.notFoundMiddleware = notFoundMiddleware;
