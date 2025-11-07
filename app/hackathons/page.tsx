'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import HackathonForm from '@/components/HackathonForm';

interface Hackathon {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  creator_username: string;
  created_at: string;
  idea_count: number;
  team_count: number;
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/hackathons');
      if (response.ok) {
        const data = await response.json();
        setHackathons(data);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleHackathonCreated = () => {
    setShowForm(false);
    fetchHackathons();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Hackathons</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage hackathons with ideas and teams
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                ← Home
              </Link>
              <Link
                href="/ideas"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Browse Ideas
              </Link>
            </div>
          </div>
        </header>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Hackathon'}
        </button>

        {showForm && <HackathonForm onHackathonCreated={handleHackathonCreated} />}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading hackathons...</p>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No hackathons yet. Create the first one!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hackathons.map((hackathon) => (
              <Link
                key={hackathon.id}
                href={`/hackathons/${hackathon.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {hackathon.name}
                </h2>
                {hackathon.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {hackathon.description}
                  </p>
                )}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Dates:</span>
                    <span>
                      {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>
                      <span className="font-medium">{hackathon.idea_count}</span> ideas
                    </span>
                    <span>
                      <span className="font-medium">{hackathon.team_count}</span> teams
                    </span>
                  </div>
                  <div className="text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                    Created by {hackathon.creator_username}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
