import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch competition status
export async function GET() {
  try {
    const competition = await prisma.competition.findFirst();
    let displayData = {
      displayingResult: false,
      displayRound: 0,
      displayYesVotes: 0,
      displayTotalVotes: 0,
    };

    try {
      const rows = await prisma.$queryRaw<
        { displayingResult: number | boolean; displayRound: number; displayYesVotes: number; displayTotalVotes: number }[]
      >`SELECT "displayingResult", "displayRound", "displayYesVotes", "displayTotalVotes" FROM "Competition" LIMIT 1`;

      if (rows[0]) {
        displayData = {
          displayingResult: !!rows[0].displayingResult,
          displayRound: Number(rows[0].displayRound) || 0,
          displayYesVotes: Number(rows[0].displayYesVotes) || 0,
          displayTotalVotes: Number(rows[0].displayTotalVotes) || 0,
        };
      }
    } catch {
      // Display columns may not exist yet; keep defaults.
    }
    
    // If no competition record exists, create a default one
    if (!competition) {
      const newCompetition = await prisma.competition.create({
        data: {
          isActive: true
        }
      });
      
      return NextResponse.json({
        ...newCompetition,
        ...displayData,
        // For backward compatibility with localStorage approach
        ended: !newCompetition.isActive
      });
    }
    
    return NextResponse.json({
      ...competition,
      ...displayData,
      // For backward compatibility with localStorage approach
      ended: !competition.isActive
    });
  } catch (error) {
    console.error('Error fetching competition status:', error);
    return NextResponse.json({ error: 'Failed to fetch competition status' }, { status: 500 });
  }
}

// POST - Update competition status
export async function POST(request: Request) {
  try {
    const { isActive } = await request.json();
    
    // Find existing competition or create a new one
    const competition = await prisma.competition.findFirst();
    
    let updatedCompetition;
    
    if (competition) {
      updatedCompetition = await prisma.competition.update({
        where: { id: competition.id },
        data: { isActive }
      });
    } else {
      updatedCompetition = await prisma.competition.create({
        data: { isActive }
      });
    }
    
    return NextResponse.json({
      ...updatedCompetition,
      // For backward compatibility with localStorage approach
      ended: !updatedCompetition.isActive
    });
  } catch (error) {
    console.error('Error updating competition status:', error);
    return NextResponse.json({ error: 'Failed to update competition status' }, { status: 500 });
  }
} 