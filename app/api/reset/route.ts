import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Reset all data and rotate session token to invalidate all cookies
export async function POST() {
  try {
    // Delete all votes
    await prisma.vote.deleteMany({});

    // Reset rounds
    await prisma.round.updateMany({
      data: { 
        isActive: false,
        timeLeft: 0
      }
    });

    // Rotate session token so all existing vote cookies are invalidated
    const newSession = crypto.randomUUID();
    await prisma.$executeRaw`UPDATE "Competition" SET "voteSession" = ${newSession}, "updatedAt" = CURRENT_TIMESTAMP`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'All data has been reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json({ 
      error: 'Failed to reset data' 
    }, { status: 500 });
  }
} 