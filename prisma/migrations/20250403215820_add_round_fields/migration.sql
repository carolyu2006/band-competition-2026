-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Round" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roundNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle1" TEXT NOT NULL DEFAULT '',
    "question" TEXT NOT NULL,
    "options" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "timeLeft" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Round" ("createdAt", "id", "isActive", "options", "question", "roundNumber", "timeLeft", "updatedAt") SELECT "createdAt", "id", "isActive", "options", "question", "roundNumber", "timeLeft", "updatedAt" FROM "Round";
DROP TABLE "Round";
ALTER TABLE "new_Round" RENAME TO "Round";
CREATE UNIQUE INDEX "Round_roundNumber_key" ON "Round"("roundNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
