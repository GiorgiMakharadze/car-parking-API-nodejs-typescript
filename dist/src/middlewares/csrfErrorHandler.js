"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfErrorHandler = void 0;
const csrfErrorHandler = (err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }
    next(err);
};
exports.csrfErrorHandler = csrfErrorHandler;
