import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureDisplayColumns() {
  const alterStatements = [
    'ALTER TABLE "Competition" ADD COLUMN "displayingResult" BOOLEAN NOT NULL DEFAULT false',
    'ALTER TABLE "Competition" ADD COLUMN "displayRound" INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE "Competition" ADD COLUMN "displayYesVotes" INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE "Competition" ADD COLUMN "displayTotalVotes" INTEGER NOT NULL DEFAULT 0',
  ];

  for (const sql of alterStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // Column probably already exists; ignore to keep this idempotent.
    }
  }
}

async function ensureCompetitionRow() {
  const rows = await prisma.$queryRaw<{ id: number }[]>`SELECT "id" FROM "Competition" LIMIT 1`;
  if (rows[0]?.id) return rows[0].id;

  const created = await prisma.competition.create({
    data: { isActive: true },
  });
  return created.id;
}

export async function POST(request: Request) {
  try {
    const { roundNumber, yesVotes, totalVotes } = await request.json();
    await ensureDisplayColumns();
    const competitionId = await ensureCompetitionRow();

    await prisma.$executeRaw`
      UPDATE "Competition"
      SET
        "displayingResult" = true,
        "displayRound" = ${Number(roundNumber) || 0},
        "displayYesVotes" = ${Number(yesVotes) || 0},
        "displayTotalVotes" = ${Number(totalVotes) || 0},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${competitionId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing result:", error);
    return NextResponse.json({ error: "Failed to publish result" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await ensureDisplayColumns();
    const competitionId = await ensureCompetitionRow();

    await prisma.$executeRaw`
      UPDATE "Competition"
      SET
        "displayingResult" = false,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${competitionId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error hiding result:", error);
    return NextResponse.json({ error: "Failed to hide result" }, { status: 500 });
  }
}
