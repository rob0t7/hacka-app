'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VoteButtons from '@/components/VoteButtons';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';

interface Idea {
  id: number;
  title: string;
  description: string;
  username: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote?: number | null;
}

interface Comment {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setIdea(data);
      } else if (response.status === 404) {
        alert('Idea not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching idea:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?ideaId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdea();
    fetchComments();
  }, [params.id]);

  const handleCommentCreated = () => {
    fetchComments();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to all ideas
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-shrink-0">
              <VoteButtons
                ideaId={idea.id}
                score={idea.score}
                upvotes={idea.upvotes}
                downvotes={idea.downvotes}
                userVote={idea.userVote}
                onVoteChange={fetchIdea}
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-4">{idea.title}</h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>Posted by <strong>{idea.username}</strong></span>
                <span className="mx-2">•</span>
                <span>{formatDate(idea.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {idea.description}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <CommentList comments={comments} />
          <CommentForm ideaId={idea.id} onCommentCreated={handleCommentCreated} />
        </div>
      </div>
    </main>
  );
}
