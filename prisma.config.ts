import "dotenv/config";
import { defineConfig } from "prisma/config";

// Bewusst process.env statt des strikten env()-Helpers: "prisma generate"
// (läuft bei jedem Build/Deploy) braucht keine echte DB-Verbindung und soll
// auch funktionieren, solange DATABASE_URL noch nicht gesetzt ist.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
