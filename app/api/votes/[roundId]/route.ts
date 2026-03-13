import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch votes for a specific round
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    const roundIdNumber = parseInt(roundId);
    
    if (isNaN(roundIdNumber)) {
      return NextResponse.json({ error: 'Invalid round ID' }, { status: 400 });
    }
    
    // Find the round by roundNumber
    const round = await prisma.round.findUnique({
      where: { roundNumber: roundIdNumber }
    });
    
    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    
    // Get votes for this round
    const votes = await prisma.vote.findMany({
      where: {
        roundId: round.id
      }
    });
    
    // Count votes by option
    const results: Record<number, number> = {};
    votes.forEach(vote => {
      results[vote.optionIndex] = (results[vote.optionIndex] || 0) + 1;
    });
    
    return NextResponse.json({
      totalVotes: votes.length,
      results,
      votes
    });
  } catch (error) {
    console.error(`Error fetching votes for round:`, error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
} 