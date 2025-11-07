import { NextRequest, NextResponse } from 'next/server';
import { getHackathonById, getHackathonIdeas, getTeamsByHackathon, updateHackathon } from '@/lib/queries';
import { getHackathonParticipants } from '@/lib/participant-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathonId = parseInt(id);

    const [hackathon, ideas, teams] = await Promise.all([
      getHackathonById(hackathonId),
      getHackathonIdeas(hackathonId),
      getTeamsByHackathon(hackathonId)
    ]);

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // Fetch participants for team-random mode
    let participants: string[] = [];
    if (hackathon.mode === 'team-random') {
      participants = await getHackathonParticipants(hackathonId);
    }

    return NextResponse.json({
      ...hackathon,
      ideas,
      teams,
      participants
    });
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    return NextResponse.json({ error: 'Failed to fetch hackathon' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathonId = parseInt(id);
    const body = await request.json();
    const { name, description, startDate, endDate, mode } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (mode && mode !== 'select' && mode !== 'random' && mode !== 'team-random') {
      return NextResponse.json(
        { error: 'Mode must be "select", "random", or "team-random"' },
        { status: 400 }
      );
    }

    const hackathon = await updateHackathon(
      hackathonId,
      name,
      description || null,
      startDate || null,
      endDate || null,
      mode || 'select'
    );

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    return NextResponse.json(hackathon);
  } catch (error) {
    console.error('Error updating hackathon:', error);
    return NextResponse.json({ error: 'Failed to update hackathon' }, { status: 500 });
  }
}
