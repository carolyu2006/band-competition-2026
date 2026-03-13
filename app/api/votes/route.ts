import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all votes
export async function GET() {
  try {
    const votes = await prisma.vote.findMany({
      include: {
        round: true
      }
    });
    
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST - Submit a vote
export async function POST(request: Request) {
  try {
    const { roundId, optionIndex } = await request.json();
    
    if (roundId === undefined || optionIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current vote session token via raw query to avoid stale type cache
    const rows = await prisma.$queryRaw<{ voteSession: string }[]>`SELECT "voteSession" FROM "Competition" LIMIT 1`;
    const sessionToken = rows[0]?.voteSession ?? '';

    const cookieStore = await cookies();
    const cookieName = `hasVoted_round_${roundId}`;
    const existingCookie = cookieStore.get(cookieName);

    // Cookie is valid only if it matches the current session token
    if (existingCookie && existingCookie.value === sessionToken && sessionToken !== '') {
      return NextResponse.json(
        { error: 'Already voted in this round on this device' },
        { status: 400 }
      );
    }
    
    // Find round
    const round = await prisma.round.findUnique({
      where: { roundNumber: roundId }
    });
    
    if (!round) {
      return NextResponse.json({ error: 'Invalid round' }, { status: 400 });
    }
    
    // Create vote — explicit columns to avoid stale type cache on codeId
    await prisma.$executeRaw`INSERT INTO "Vote" ("roundId", "optionIndex", "createdAt", "updatedAt") VALUES (${round.id}, ${optionIndex}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    const vote = { roundId: round.id, optionIndex };
    
    const response = NextResponse.json(vote);

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}

// GET results by round
export async function getResultsByRound(roundId: number) {
  try {
    const votes = await prisma.vote.findMany({
      where: {
        roundId
      }
    });
    
    // Count votes by option
    const results = votes.reduce((acc, vote) => {
      acc[vote.optionIndex] = (acc[vote.optionIndex] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return results;
  } catch (error) {
    console.error('Error getting vote results:', error);
    throw error;
  }
}

// DELETE - Clear all votes and rotate session token to invalidate all cookies
export async function DELETE() {
  try {
    await prisma.vote.deleteMany({});

    // Set all rounds to inactive
    await prisma.round.updateMany({
      data: { isActive: false }
    });

    // Rotate session token so all existing vote cookies are invalidated
    const newSession = crypto.randomUUID();
    await prisma.$executeRaw`UPDATE "Competition" SET "voteSession" = ${newSession}, "updatedAt" = CURRENT_TIMESTAMP`;
    
    return NextResponse.json({ message: 'All votes cleared and session rotated' });
  } catch (error) {
    console.error('Error clearing votes:', error);
    return NextResponse.json({ error: 'Failed to clear votes' }, { status: 500 });
  }
} 