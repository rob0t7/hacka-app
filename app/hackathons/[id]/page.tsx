'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TeamForm from '@/components/TeamForm';
import IdeaSelector from '@/components/IdeaSelector';
import HackathonEditForm from '@/components/HackathonEditForm';

interface Idea {
  id: number;
  title: string;
  description: string;
  username: string;
  score: number;
  upvotes: number;
  downvotes: number;
}

interface Team {
  id: number;
  name: string;
  idea_title: string | null;
  creator_username: string;
  member_count: number;
  members: string[];
}

interface Hackathon {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  mode: 'select' | 'random' | 'team-random';
  creator_username: string;
  ideas: Idea[];
  teams: Team[];
  participants?: string[];
}

export default function HackathonDetailPage() {
  const params = useParams();
  const hackathonId = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showIdeaSelector, setShowIdeaSelector] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [username, setUsername] = useState('');

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/hackathons/${hackathonId}`);
      if (response.ok) {
        const data = await response.json();
        setHackathon(data);
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathon();
    const storedUsername = localStorage.getItem('username') || '';
    setUsername(storedUsername);
  }, [hackathonId]);

  const handleTeamCreated = () => {
    setShowTeamForm(false);
    fetchHackathon();
  };

  const handleIdeasUpdated = () => {
    setShowIdeaSelector(false);
    fetchHackathon();
  };

  const handleHackathonUpdated = () => {
    setShowEditForm(false);
    fetchHackathon();
  };

  const handleJoinTeam = async (teamId: number, teamName: string) => {
    if (!username) {
      const newUsername = prompt('Enter your username to join:');
      if (!newUsername || !newUsername.trim()) return;
      localStorage.setItem('username', newUsername.trim());
      setUsername(newUsername.trim());
      await joinTeam(teamId, newUsername.trim(), teamName);
    } else {
      await joinTeam(teamId, username, teamName);
    }
  };

  const joinTeam = async (teamId: number, user: string, teamName: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✓ Successfully joined "${teamName}"!`);
        fetchHackathon();
      } else {
        const error = await response.json();
        alert(`Failed to join team: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team. Please try again.');
    }
  };

  const isUserInTeam = (team: Team): boolean => {
    return team.members?.includes(username) || false;
  };

  const handleLeaveTeam = async (teamId: number, teamName: string) => {
    if (!username) return;

    const confirmed = confirm(`Are you sure you want to leave "${teamName}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/members?username=${encodeURIComponent(username)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert(`✓ Successfully left "${teamName}"`);
        fetchHackathon();
      } else {
        const error = await response.json();
        alert(`Failed to leave team: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      alert('Failed to leave team. Please try again.');
    }
  };

  const handleJoinHackathon = async () => {
    if (!username) {
      const newUsername = prompt('Enter your username to join:');
      if (!newUsername || !newUsername.trim()) return;
      localStorage.setItem('username', newUsername.trim());
      setUsername(newUsername.trim());
    }

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || newUsername })
      });

      if (response.ok) {
        alert('✓ Successfully joined the hackathon!');
        fetchHackathon();
      } else {
        const error = await response.json();
        alert(`Failed to join: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error joining hackathon:', error);
      alert('Failed to join. Please try again.');
    }
  };

  const handleLeaveHackathon = async () => {
    if (!username) return;

    const confirmed = confirm('Are you sure you want to leave this hackathon?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/participants?username=${encodeURIComponent(username)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✓ Successfully left the hackathon');
        fetchHackathon();
      } else {
        const error = await response.json();
        alert(`Failed to leave: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error leaving hackathon:', error);
      alert('Failed to leave. Please try again.');
    }
  };

  const handleRandomizeTeams = async () => {
    const teamSizeStr = prompt('Enter desired team size (default is 4):', '4');
    if (!teamSizeStr) return;

    const teamSize = parseInt(teamSizeStr);
    if (isNaN(teamSize) || teamSize < 1) {
      alert('Please enter a valid team size');
      return;
    }

    const confirmed = confirm(`This will delete all existing teams and create new balanced teams of size ${teamSize}. Continue?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/hackathons/${hackathonId}/randomize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamSize })
      });

      if (response.ok) {
        alert('✓ Teams randomized successfully!');
        fetchHackathon();
      } else {
        const error = await response.json();
        alert(`Failed to randomize teams: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error randomizing teams:', error);
      alert('Failed to randomize teams. Please try again.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Hackathon not found</p>
          <Link href="/hackathons" className="text-blue-600 hover:text-blue-700">
            ← Back to Hackathons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            href="/hackathons"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Hackathons
          </Link>
        </div>

        <header className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-4xl font-bold">{hackathon.name}</h1>
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {showEditForm ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
          {hackathon.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hackathon.description}
            </p>
          )}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Start:</span> {formatDate(hackathon.start_date)}
            </div>
            <div>
              <span className="font-medium">End:</span> {formatDate(hackathon.end_date)}
            </div>
            <div>
              <span className="font-medium">Mode:</span>{' '}
              <span className={`px-2 py-1 rounded text-xs ${
                hackathon.mode === 'random'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : hackathon.mode === 'team-random'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}>
                {hackathon.mode === 'random'
                  ? 'Hard Consulting Mode'
                  : hackathon.mode === 'team-random'
                  ? 'Random Team Assignment'
                  : 'Teams Select Ideas'}
              </span>
            </div>
            <div>
              <span className="font-medium">Created by:</span> {hackathon.creator_username}
            </div>
          </div>
        </header>

        {showEditForm && (
          <HackathonEditForm
            hackathon={hackathon}
            onHackathonUpdated={handleHackathonUpdated}
            onCancel={() => setShowEditForm(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ideas Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Selected Ideas ({hackathon.ideas.length})</h2>
              <button
                onClick={() => setShowIdeaSelector(!showIdeaSelector)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {showIdeaSelector ? 'Close' : '+ Add Ideas'}
              </button>
            </div>

            {showIdeaSelector && (
              <IdeaSelector
                hackathonId={parseInt(hackathonId)}
                currentIdeas={hackathon.ideas}
                onIdeasUpdated={handleIdeasUpdated}
              />
            )}

            {hackathon.ideas.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No ideas selected yet. Add some ideas to this hackathon!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {hackathon.ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                  >
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {idea.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                      {idea.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>by {idea.username}</span>
                      <span>↑ {idea.upvotes}</span>
                      <span>↓ {idea.downvotes}</span>
                      <span className="font-medium">Score: {idea.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teams Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Teams ({hackathon.teams.length})</h2>
              <button
                onClick={() => setShowTeamForm(!showTeamForm)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {showTeamForm ? 'Cancel' : '+ Create Team'}
              </button>
            </div>

            {showTeamForm && (
              <TeamForm
                hackathonId={parseInt(hackathonId)}
                hackathonMode={hackathon.mode}
                ideas={hackathon.ideas}
                onTeamCreated={handleTeamCreated}
              />
            )}

            {hackathon.teams.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No teams yet. Be the first to create one!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {hackathon.teams.map((team) => {
                  const userInTeam = isUserInTeam(team);
                  return (
                    <div
                      key={team.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{team.name}</h3>
                        <div className="flex gap-2">
                          {userInTeam ? (
                            <button
                              onClick={() => handleLeaveTeam(team.id, team.name)}
                              className="text-sm px-3 py-1 rounded transition-colors bg-red-600 hover:bg-red-700 text-white"
                            >
                              Leave Team
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinTeam(team.id, team.name)}
                              className="text-sm px-3 py-1 rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    {team.idea_title && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Working on: <span className="font-medium">{team.idea_title}</span>
                      </p>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-1">
                        Created by {team.creator_username} • {team.member_count} member
                        {team.member_count !== 1 ? 's' : ''}
                      </p>
                      {team.members && team.members.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {team.members.map((member, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
