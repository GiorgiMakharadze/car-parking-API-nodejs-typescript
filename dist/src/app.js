"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const middlewares_1 = require("./middlewares");
const userAuthRoutes_1 = __importDefault(require("./routes/userAuthRoutes"));
const createApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use("/api/v1/auth", userAuthRoutes_1.default);
    app.use(middlewares_1.notFoundMiddleware);
    app.use(middlewares_1.errorHandlerMiddleware);
    return app;
};
exports.default = createApp;
