import { NextRequest, NextResponse } from 'next/server';
import { getAllHackathons, createHackathon, getOrCreateUser } from '@/lib/queries';

export async function GET() {
  try {
    const hackathons = await getAllHackathons();
    return NextResponse.json(hackathons);
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    return NextResponse.json({ error: 'Failed to fetch hackathons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, startDate, endDate, mode, username } = body;

    if (!name || !username) {
      return NextResponse.json(
        { error: 'Name and username are required' },
        { status: 400 }
      );
    }

    if (mode && mode !== 'select' && mode !== 'random' && mode !== 'team-random') {
      return NextResponse.json(
        { error: 'Mode must be "select", "random", or "team-random"' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(username);
    const hackathon = await createHackathon(
      name,
      description || null,
      startDate || null,
      endDate || null,
      mode || 'select',
      user.id
    );

    return NextResponse.json(hackathon, { status: 201 });
  } catch (error) {
    console.error('Error creating hackathon:', error);
    return NextResponse.json({ error: 'Failed to create hackathon' }, { status: 500 });
  }
}
