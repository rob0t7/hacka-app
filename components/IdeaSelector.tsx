'use client';

import { useEffect, useState } from 'react';

interface Idea {
  id: number;
  title: string;
  description: string;
  username: string;
  score: number;
}

interface IdeaSelectorProps {
  hackathonId: number;
  currentIdeas: Idea[];
  onIdeasUpdated: () => void;
}

export default function IdeaSelector({ hackathonId, currentIdeas, onIdeasUpdated }: IdeaSelectorProps) {
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllIdeas();
  }, []);

  const fetchAllIdeas = async () => {
    try {
      const response = await fetch('/api/ideas');
      if (response.ok) {
        const data = await response.json();
        setAllIdeas(data);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isIdeaSelected = (ideaId: number) => {
    return currentIdeas.some(idea => idea.id === ideaId);
  };

  const handleToggleIdea = async (ideaId: number, shouldAdd: boolean) => {
    try {
      if (shouldAdd) {
        const response = await fetch(`/api/hackathons/${hackathonId}/ideas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ideaId })
        });

        if (response.ok) {
          onIdeasUpdated();
        }
      } else {
        const response = await fetch(`/api/hackathons/${hackathonId}/ideas?ideaId=${ideaId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onIdeasUpdated();
        }
      }
    } catch (error) {
      console.error('Error toggling idea:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600 dark:text-gray-400">Loading ideas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Select Ideas for Hackathon</h3>

      {allIdeas.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No ideas available</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allIdeas.map((idea) => {
            const selected = isIdeaSelected(idea.id);
            return (
              <div
                key={idea.id}
                className={`border rounded-lg p-3 transition-colors ${
                  selected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{idea.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {idea.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>by {idea.username}</span>
                      <span>Score: {idea.score}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleIdea(idea.id, !selected)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors flex-shrink-0 ${
                      selected
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {selected ? 'Remove' : 'Add'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
