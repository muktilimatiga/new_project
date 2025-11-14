import { Router } from "express";
import * as fibers from '../services/fibers.services'

export const fibersRouter = Router();

fibersRouter.get("/", async (req, res, next) => {
  try {
    const data = await fibers.findAllFibers();
    res.json(data);
  } catch (err) { next(err); }
});

fibersRouter.get("/:user_pppoe", async (req, res, next) => {
  try {
    const item = await fibers.findFiberByUser(req.params.user_pppoe);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) { next(err); }
});
