import "dotenv/config";
import app from "./app";
import { logger } from "./utils/logger";
import { prisma } from "./prisma/client";

const PORT = Number(process.env.PORT || 3000);

async function main() {
  logger.info("starting server");
  app.listen(PORT, () => logger.info(`Listening on ${PORT}`));
  // optional: test DB connection
  await prisma.$connect();
}
main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
