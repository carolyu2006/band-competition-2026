-- AlterTable
ALTER TABLE "Competition" ADD COLUMN "displayingResult" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Competition" ADD COLUMN "displayRound" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Competition" ADD COLUMN "displayYesVotes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Competition" ADD COLUMN "displayTotalVotes" INTEGER NOT NULL DEFAULT 0;
