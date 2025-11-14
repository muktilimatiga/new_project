import express from "express";
import helmet from "helmet";
import cors from 'cors'
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger";
import { authRouter } from "./controllers/auth.controller";
import { fibersRouter } from "./controllers/fibers.controller";
import { logsRouter } from "./controllers/logs.controller";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// routes
app.use("/auth", authRouter);
app.use("/fibers", fibersRouter);
app.use("/logs", logsRouter);

// error handler
app.use(errorHandler);

export default app;
