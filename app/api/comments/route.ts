import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByIdeaId, createComment, getOrCreateUser } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 });
    }

    const comments = await getCommentsByIdeaId(parseInt(ideaId));
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, username, content } = body;

    if (!ideaId || !username || !content) {
      return NextResponse.json(
        { error: 'ideaId, username, and content are required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(username);
    const comment = await createComment(ideaId, user.id, content);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
