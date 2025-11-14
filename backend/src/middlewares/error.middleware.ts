import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({ err }, "unhandled.error");
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || "Internal server error",
  });
}
