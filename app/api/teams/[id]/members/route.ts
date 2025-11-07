import { NextRequest, NextResponse } from 'next/server';
import { addTeamMember, removeTeamMember, getOrCreateUser } from '@/lib/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 });
    }

    const user = await getOrCreateUser(username);
    await addTeamMember(teamId, user.id);

    return NextResponse.json({ message: 'Member added to team' });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 });
    }

    const user = await getOrCreateUser(username);
    await removeTeamMember(teamId, user.id);

    return NextResponse.json({ message: 'Member removed from team' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}
