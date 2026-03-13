import { NextResponse } from 'next/server';

// A simple admin authentication
export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Get admin password from environment variables
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (password === adminPassword) {
      return NextResponse.json({ 
        success: true,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid password' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Authentication failed' 
    }, { status: 500 });
  }
} 