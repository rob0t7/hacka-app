'use client';

import { useState } from 'react';

interface CommentFormProps {
  ideaId: number;
  onCommentCreated: () => void;
}

export default function CommentForm({ ideaId, onCommentCreated }: CommentFormProps) {
  const [content, setContent] = useState('');
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
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId,
          username: finalUsername,
          content,
        }),
      });

      if (response.ok) {
        setContent('');
        onCommentCreated();
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Add a Comment</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 min-h-[100px]"
        placeholder="Share your thoughts..."
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}
