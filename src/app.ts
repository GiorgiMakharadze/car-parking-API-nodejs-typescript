import express from "express";
import "express-async-errors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import xss from "xss";
import CSRF from "csrf";
import { notFoundMiddleware, errorHandlerMiddleware } from "./middlewares";
import authUserRouter from "./routes/userAuthRoutes";
import adminRouter from "./routes/adminRoutes";

const createApp = () => {
  const app = express();

  // 1. Middleware for standard request parsing
  app.use(express.json());

  // 2. Security middlewares
  app.use(helmet());
  app.use(cookieParser());

  // 3. XSS protection middleware
  app.use((req, res, next) => {
    if (req.body) {
      req.body = JSON.parse(xss(JSON.stringify(req.body)));
    }
    next();
  });

  // 4. CSRF protection middleware
  const csrfProtection = new CSRF();
  app.use((req, res, next) => {
    const token = csrfProtection.create(req.cookies._csrf);
    res.cookie("_csrf", token);
    next();
  });

  // 5. Routes
  app.use("/api/v1/auth", authUserRouter);
  app.use("/api/v1/admin", adminRouter);

  // 6. Error handling middlewares
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};

export default createApp;
