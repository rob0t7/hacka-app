'use client';

import Link from 'next/link';
import VoteButtons from './VoteButtons';

interface IdeaCardProps {
  idea: {
    id: number;
    title: string;
    description: string;
    username: string;
    created_at: string;
    upvotes: number;
    downvotes: number;
    score: number;
    userVote?: number | null;
  };
  onVoteChange: () => void;
}

export default function IdeaCard({ idea, onVoteChange }: IdeaCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <VoteButtons
            ideaId={idea.id}
            score={idea.score}
            upvotes={idea.upvotes}
            downvotes={idea.downvotes}
            userVote={idea.userVote}
            onVoteChange={onVoteChange}
          />
        </div>
        <div className="flex-grow">
          <Link href={`/ideas/${idea.id}`}>
            <h3 className="text-xl font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
              {idea.title}
            </h3>
          </Link>
          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
            {idea.description}
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Posted by <strong>{idea.username}</strong></span>
            <span className="mx-2">•</span>
            <span>{formatDate(idea.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
