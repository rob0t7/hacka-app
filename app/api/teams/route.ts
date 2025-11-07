import { NextRequest, NextResponse } from 'next/server';
import { createTeam, getOrCreateUser, getHackathonById, getHackathonIdeas } from '@/lib/queries';

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

    // Get hackathon to check mode
    const hackathon = await getHackathonById(hackathonId);
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    let finalIdeaId = ideaId || null;

    // If hackathon is in random mode and no ideaId is provided, randomly assign one
    if (hackathon.mode === 'random' && !ideaId) {
      const ideas = await getHackathonIdeas(hackathonId);
      if (ideas.length > 0) {
        // Randomly select an idea
        const randomIndex = Math.floor(Math.random() * ideas.length);
        finalIdeaId = ideas[randomIndex].id;
      }
    }

    const team = await createTeam(name, hackathonId, finalIdeaId, user.id);

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
