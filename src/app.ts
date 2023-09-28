import express from "express";
import "express-async-errors";
import cors from "cors";
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
import userRoutes from "./routes/userRoutes";

const createApp = () => {
  const app = express();

  app.use(express.json());

  app.use(helmet());
  app.use(cookieParser());

  app.use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
      methods: ["GET", "POST", "PATCH", "DELETE"],
    })
  );

  app.use((req, res, next) => {
    if (req.body) {
      req.body = JSON.parse(xss(JSON.stringify(req.body)));
    }
    next();
  });

  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );
  app.use(csrfErrorHandler);

  app.get("/api/v1/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
  app.use("/api/v1/auth", authUserRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/users", userRoutes);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};

export default createApp;
