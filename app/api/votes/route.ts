import { NextRequest, NextResponse } from 'next/server';
import { upsertVote, removeVote, getOrCreateUser } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, username, voteType } = body;

    if (!ideaId || !username) {
      return NextResponse.json(
        { error: 'ideaId and username are required' },
        { status: 400 }
      );
    }

    if (voteType !== 1 && voteType !== -1 && voteType !== 0) {
      return NextResponse.json(
        { error: 'voteType must be 1 (upvote), -1 (downvote), or 0 (remove vote)' },
        { status: 400 }
      );
    }

    const user = getOrCreateUser(username);

    let idea;
    if (voteType === 0) {
      // Remove vote
      idea = removeVote(ideaId, user.id);
    } else {
      // Upvote or downvote
      idea = upsertVote(ideaId, user.id, voteType);
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}
