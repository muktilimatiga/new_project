import { Router } from "express";
import * as logs from '../services/logs.services'

export const logsRouter = Router();

logsRouter.get("/", async (req, res, next) => {
  try {
    const data = await logs.getLogs();
    res.json(data);
  } catch (err) { next(err); }
});

logsRouter.post("/", async (req, res, next) => {
  try {
    const created = await logs.createLog(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
});
