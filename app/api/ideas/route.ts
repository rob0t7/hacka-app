import { NextRequest, NextResponse } from 'next/server';
import { getAllIdeas, createIdea, getOrCreateUser } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const ideas = await getAllIdeas(userId ? parseInt(userId) : undefined);
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, username } = body;

    if (!title || !description || !username) {
      return NextResponse.json(
        { error: 'Title, description, and username are required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(username);
    const idea = await createIdea(title, description, user.id);

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}
