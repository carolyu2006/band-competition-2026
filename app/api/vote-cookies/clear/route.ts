import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // Rotate session token so all existing vote cookies become invalid for all users
    const newSession = crypto.randomUUID();
    await prisma.$executeRaw`UPDATE "Competition" SET "voteSession" = ${newSession}, "updatedAt" = CURRENT_TIMESTAMP`;

    return NextResponse.json({ success: true, message: 'All vote cookies invalidated' });
  } catch (error) {
    console.error('Error clearing vote cookies:', error);
    return NextResponse.json({ error: 'Failed to clear vote cookies' }, { status: 500 });
  }
}
