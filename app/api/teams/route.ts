import { NextRequest, NextResponse } from 'next/server';
import { createTeam, getOrCreateUser } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, hackathonId, ideaId, username } = body;

    if (!name || !hackathonId || !username) {
      return NextResponse.json(
        { error: 'Name, hackathonId, and username are required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(username);
    const team = await createTeam(name, hackathonId, ideaId || null, user.id);

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
