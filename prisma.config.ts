import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import path from "path";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
});
