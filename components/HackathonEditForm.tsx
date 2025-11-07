'use client';

import { useState } from 'react';

interface Hackathon {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  mode: 'select' | 'random' | 'team-random';
}

interface HackathonEditFormProps {
  hackathon: Hackathon;
  onHackathonUpdated: () => void;
  onCancel: () => void;
}

export default function HackathonEditForm({ hackathon, onHackathonUpdated, onCancel }: HackathonEditFormProps) {
  const [name, setName] = useState(hackathon.name);
  const [description, setDescription] = useState(hackathon.description || '');
  const [startDate, setStartDate] = useState(
    hackathon.start_date ? new Date(hackathon.start_date).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    hackathon.end_date ? new Date(hackathon.end_date).toISOString().split('T')[0] : ''
  );
  const [mode, setMode] = useState<'select' | 'random' | 'team-random'>(hackathon.mode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/hackathons/${hackathon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          startDate: startDate || null,
          endDate: endDate || null,
          mode
        })
      });

      if (response.ok) {
        onHackathonUpdated();
      } else {
        alert('Failed to update hackathon');
      }
    } catch (error) {
      console.error('Error updating hackathon:', error);
      alert('Failed to update hackathon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">Edit Hackathon</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
            placeholder="Enter hackathon name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
            placeholder="Describe the hackathon"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Team Assignment Mode *
          </label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="mode"
                value="select"
                checked={mode === 'select'}
                onChange={(e) => setMode(e.target.value as 'select' | 'random' | 'team-random')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Teams Select Ideas</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Teams can choose which idea they want to work on from the hackathon's idea pool
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="mode"
                value="random"
                checked={mode === 'random'}
                onChange={(e) => setMode(e.target.value as 'select' | 'random' | 'team-random')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Hard Consulting Mode</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Ideas are randomly assigned to teams when they are created - just like in consulting!
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                name="mode"
                value="team-random"
                checked={mode === 'team-random'}
                onChange={(e) => setMode(e.target.value as 'select' | 'random' | 'team-random')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Random Team Assignment</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Participants join the hackathon and get randomly assigned to balanced teams
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Hackathon'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
