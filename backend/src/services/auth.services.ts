import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/token";

export async function registerUser(username: string, plainPassword: string, fullName?: string, role?: string) {
  const hashed = await bcrypt.hash(plainPassword, 10);
  const user = await prisma.users.create({
    data: { username, password: plainPassword, hashed_password: hashed, full_name: fullName, role },
  });
  return user;
}

export async function authenticate(username: string, plainPassword: string) {
  const user = await prisma.users.findFirst({ where: { username } });
  if (!user) return null;
  const ok = await bcrypt.compare(plainPassword, user.hashed_password || "");
  if (!ok) return null;

  const payload = { id: user.id, username: user.username, role: user.role };
  const access = await signAccessToken(payload);
  const refresh = await signRefreshToken(payload);
  return { user, tokens: { access, refresh } };
}
