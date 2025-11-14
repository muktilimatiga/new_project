import { PrismaClient } from "@prisma/client";
import { logger } from '../utils/logger'

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
  ],
});

prisma.$on("query", (e) => {
  logger.debug({ sql: e.query, params: e.params }, "prisma.query");
});
prisma.$on("error", (e) => {
  logger.error({ error: e }, "prisma.error");
});
