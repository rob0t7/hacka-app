import { NextRequest, NextResponse } from 'next/server';
import { randomizeTeams } from '@/lib/participant-queries';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathonId = parseInt(id);
    const body = await request.json();
    const { teamSize } = body;

    await randomizeTeams(hackathonId, teamSize || 4);

    return NextResponse.json({ message: 'Teams randomized successfully' });
  } catch (error) {
    console.error('Error randomizing teams:', error);
    return NextResponse.json({ error: 'Failed to randomize teams' }, { status: 500 });
  }
}
