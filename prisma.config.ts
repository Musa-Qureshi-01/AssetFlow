import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    // Fall back to a dummy URL during `prisma generate` on CI where
    // DATABASE_URL is not available. A real URL is still required at runtime.
    url: process.env.DATABASE_URL ?? "postgresql://localhost/dummy",
  },
});
