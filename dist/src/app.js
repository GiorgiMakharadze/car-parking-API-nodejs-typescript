"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const xss_1 = __importDefault(require("xss"));
const csurf_1 = __importDefault(require("csurf"));
const middlewares_1 = require("./middlewares");
const userAuthRoutes_1 = __importDefault(require("./routes/userAuthRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const utils_1 = require("./utils");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({
        origin: true,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
        methods: ["GET", "POST", "PATCH", "DELETE"],
    }));
    app.use((req, res, next) => {
        if (req.body) {
            req.body = JSON.parse((0, xss_1.default)(JSON.stringify(req.body)));
        }
        next();
    });
    app.use((0, csurf_1.default)({
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        },
    }));
    app.use(middlewares_1.csrfErrorHandler);
    app.get("/api/v1/csrf-token", (req, res) => {
        res.json({ csrfToken: req.csrfToken() });
    });
    app.use("/api/v1/auth", userAuthRoutes_1.default);
    app.use("/api/v1/admin", utils_1.authenticateToken, utils_1.adminValidation, adminRoutes_1.default);
    app.use("/api/v1/users", utils_1.authenticateToken, utils_1.userValidation, userRoutes_1.default);
    app.use(middlewares_1.notFoundMiddleware);
    app.use(middlewares_1.errorHandlerMiddleware);
    return app;
};
exports.default = createApp;
