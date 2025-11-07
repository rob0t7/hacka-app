import { NextRequest, NextResponse } from 'next/server';
import { addIdeaToHackathon, removeIdeaFromHackathon } from '@/lib/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathonId = parseInt(id);
    const body = await request.json();
    const { ideaId } = body;

    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 });
    }

    await addIdeaToHackathon(hackathonId, ideaId);
    return NextResponse.json({ message: 'Idea added to hackathon' });
  } catch (error) {
    console.error('Error adding idea to hackathon:', error);
    return NextResponse.json({ error: 'Failed to add idea to hackathon' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathonId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 });
    }

    await removeIdeaFromHackathon(hackathonId, parseInt(ideaId));
    return NextResponse.json({ message: 'Idea removed from hackathon' });
  } catch (error) {
    console.error('Error removing idea from hackathon:', error);
    return NextResponse.json({ error: 'Failed to remove idea from hackathon' }, { status: 500 });
  }
}
