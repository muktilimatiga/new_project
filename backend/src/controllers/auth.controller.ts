import { Router } from "express";
import { authenticate, registerUser } from '../services/auth.services'

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password, full_name, role } = req.body;
    const user = await registerUser(username, password, full_name, role);
    res.status(201).json({ user });
  } catch (err) { next(err); }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authenticate(username, password);
    if (!result) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ user: result.user, tokens: result.tokens });
  } catch (err) { next(err); }
});
