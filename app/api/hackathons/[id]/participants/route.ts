import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/queries';
import { addHackathonParticipant, removeHackathonParticipant } from '@/lib/participant-queries';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathonId = parseInt(id);
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(username);
    await addHackathonParticipant(hackathonId, user.id);

    return NextResponse.json({ message: 'Participant added successfully' });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathonId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(username);
    await removeHackathonParticipant(hackathonId, user.id);

    return NextResponse.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 });
  }
}
