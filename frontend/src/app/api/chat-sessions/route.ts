import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    // Forward to Strapi API
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: JSON.stringify({
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      })
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Forward to Strapi API
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-sessions/${sessionId}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat session' },
      { status: 500 }
    );
  }
}
