import { NextRequest, NextResponse } from 'next/server';
import { getHackathonById, getHackathonIdeas, getTeamsByHackathon } from '@/lib/queries';

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

    return NextResponse.json({
      ...hackathon,
      ideas,
      teams
    });
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    return NextResponse.json({ error: 'Failed to fetch hackathon' }, { status: 500 });
  }
}
