import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roundId = searchParams.get('roundId');

  if (roundId === null) {
    return NextResponse.json({ error: 'Missing roundId' }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<{ voteSession: string }[]>`SELECT "voteSession" FROM "Competition" LIMIT 1`;
  const sessionToken = rows[0]?.voteSession ?? '';

  const cookieStore = await cookies();
  const cookieName = `hasVoted_round_${roundId}`;
  const cookie = cookieStore.get(cookieName);

  // Only treat as voted if cookie exists AND matches the current session
  const hasVoted = !!cookie && cookie.value === sessionToken && sessionToken !== '';

  return NextResponse.json({ hasVoted });
}
