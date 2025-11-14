import { prisma } from "../prisma/client";

export const getLogs = async () => prisma.log_komplain.findMany({ orderBy: { id: "desc" } });

export const createLog = async (payload: any) => prisma.log_komplain.create({ data: payload });
