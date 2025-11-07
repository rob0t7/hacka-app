'use client';

import { useEffect, useState } from 'react';
import IdeaCard from '@/components/IdeaCard';
import IdeaForm from '@/components/IdeaForm';

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

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas');
      if (response.ok) {
        const data = await response.json();
        setIdeas(data);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleIdeaCreated = () => {
    setShowForm(false);
    fetchIdeas();
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hackathon Ideas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share and vote on hackathon and improvement ideas
          </p>
        </header>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Idea'}
        </button>

        {showForm && <IdeaForm onIdeaCreated={handleIdeaCreated} />}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No ideas yet. Be the first to share one!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onVoteChange={fetchIdeas} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
