import jwt from "jsonwebtoken";
import { promisify } from "util";

const sign = promisify(jwt.sign as any);
const verify = promisify(jwt.verify as any);

export async function signAccessToken(payload: object) {
  return sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

export async function signRefreshToken(payload: object) {
  return sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

export async function verifyAccessToken(token: string) {
  return verify(token, process.env.JWT_ACCESS_SECRET as string);
}

export async function verifyRefreshToken(token: string) {
  return verify(token, process.env.JWT_REFRESH_SECRET as string);
}
