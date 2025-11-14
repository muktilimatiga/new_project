import { prisma } from "../prisma/client";

export const findAllFibers = async () => prisma.data_fiber.findMany();
export const findFiberByUser = async (user_pppoe: string) => prisma.data_fiber.findUnique({ where: { user_pppoe } });
