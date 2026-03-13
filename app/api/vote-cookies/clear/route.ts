import { NextResponse } from 'next/server';

const TOTAL_ROUNDS = 9;

export async function POST() {
  const response = NextResponse.json({ success: true });

  for (let roundId = 0; roundId < TOTAL_ROUNDS; roundId++) {
    const cookieName = `hasVoted_round_${roundId}`;
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    });
  }

  return response;
}

