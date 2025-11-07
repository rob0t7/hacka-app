import { NextRequest, NextResponse } from 'next/server';
import { getIdeaById } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ideaId = parseInt(id);
    const userId = request.headers.get('x-user-id');

    if (isNaN(ideaId)) {
      return NextResponse.json({ error: 'Invalid idea ID' }, { status: 400 });
    }

    const idea = getIdeaById(ideaId, userId ? parseInt(userId) : undefined);

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 });
  }
}
