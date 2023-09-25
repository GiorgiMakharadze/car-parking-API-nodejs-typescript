import express from "express";
import "express-async-errors";
import cookieParser from "cookie-parser";
import { notFoundMiddleware, errorHandlerMiddleware } from "./middlewares";
import authUserRouter from "./routes/userAuthRoutes";
import adminRouter from "./routes/adminRoutes";

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/v1/auth", authUserRouter);

  app.use("/api/v1/admin", adminRouter);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};

export default createApp;
