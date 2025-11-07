'use client';

import { useState } from 'react';

interface Idea {
  id: number;
  title: string;
}

interface TeamFormProps {
  hackathonId: number;
  ideas: Idea[];
  onTeamCreated: () => void;
}

export default function TeamForm({ hackathonId, ideas, onTeamCreated }: TeamFormProps) {
  const [name, setName] = useState('');
  const [ideaId, setIdeaId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = localStorage.getItem('username') || prompt('Enter your username:');
    if (!username) return;

    localStorage.setItem('username', username);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          hackathonId,
          ideaId: ideaId ? parseInt(ideaId) : null,
          username
        })
      });

      if (response.ok) {
        setName('');
        setIdeaId('');
        onTeamCreated();
      } else {
        alert('Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
    >
      <h3 className="text-lg font-semibold mb-4">Create New Team</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium mb-2">
            Team Name *
          </label>
          <input
            id="teamName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
            placeholder="Enter team name"
          />
        </div>

        <div>
          <label htmlFor="ideaSelect" className="block text-sm font-medium mb-2">
            Select Idea (Optional)
          </label>
          <select
            id="ideaSelect"
            value={ideaId}
            onChange={(e) => setIdeaId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
          >
            <option value="">-- No idea selected --</option>
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Team'}
        </button>
      </div>
    </form>
  );
}
