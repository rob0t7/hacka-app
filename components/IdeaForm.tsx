'use client';

import { useState } from 'react';

interface IdeaFormProps {
  onIdeaCreated: () => void;
}

export default function IdeaForm({ onIdeaCreated }: IdeaFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const username = localStorage.getItem('username');
    if (!username) {
      const newUsername = prompt('Please enter your username:');
      if (!newUsername) return;
      localStorage.setItem('username', newUsername);
    }

    const finalUsername = localStorage.getItem('username')!;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          username: finalUsername,
        }),
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        onIdeaCreated();
      } else {
        alert('Failed to create idea. Please try again.');
      }
    } catch (error) {
      console.error('Error creating idea:', error);
      alert('Failed to create idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Share Your Idea</h2>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
          placeholder="Enter a catchy title for your idea"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 min-h-[120px]"
          placeholder="Describe your idea in detail..."
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Idea'}
      </button>
    </form>
  );
}
