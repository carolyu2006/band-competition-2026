-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VotingCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VotingCode" ("code", "createdAt", "id", "updatedAt") SELECT "code", "createdAt", "id", "updatedAt" FROM "VotingCode";
DROP TABLE "VotingCode";
ALTER TABLE "new_VotingCode" RENAME TO "VotingCode";
CREATE UNIQUE INDEX "VotingCode_code_key" ON "VotingCode"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
