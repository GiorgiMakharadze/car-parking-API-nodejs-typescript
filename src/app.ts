import express from "express";
import "express-async-errors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import xss from "xss";
import csurf from "csurf";

import {
  notFoundMiddleware,
  errorHandlerMiddleware,
  csrfErrorHandler,
} from "./middlewares";
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

  // 4. CSRF
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );
  app.use(csrfErrorHandler);

  // 5. Routes
  app.get("/api/v1/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
  app.use("/api/v1/auth", authUserRouter);
  app.use("/api/v1/admin", adminRouter);

  // 6. Error handling middlewares
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};

export default createApp;
