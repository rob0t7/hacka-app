'use client';

interface VoteButtonsProps {
  ideaId: number;
  score: number;
  upvotes: number;
  downvotes: number;
  userVote?: number | null;
  onVoteChange: () => void;
}

export default function VoteButtons({
  ideaId,
  score,
  upvotes,
  downvotes,
  userVote,
  onVoteChange,
}: VoteButtonsProps) {
  const handleVote = async (voteType: number) => {
    const username = localStorage.getItem('username');
    if (!username) {
      const newUsername = prompt('Please enter your username:');
      if (!newUsername) return;
      localStorage.setItem('username', newUsername);
    }

    const finalUsername = localStorage.getItem('username')!;

    // If clicking the same vote, remove it (toggle off)
    const finalVoteType = userVote === voteType ? 0 : voteType;

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId,
          username: finalUsername,
          voteType: finalVoteType,
        }),
      });

      if (response.ok) {
        onVoteChange();
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        className={`px-3 py-1 rounded-lg transition-colors ${
          userVote === 1
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900'
        }`}
        title={`Upvotes: ${upvotes}`}
      >
        ▲ {upvotes}
      </button>
      <span className="font-bold text-lg min-w-[2rem] text-center">{score}</span>
      <button
        onClick={() => handleVote(-1)}
        className={`px-3 py-1 rounded-lg transition-colors ${
          userVote === -1
            ? 'bg-red-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900'
        }`}
        title={`Downvotes: ${downvotes}`}
      >
        ▼ {downvotes}
      </button>
    </div>
  );
}
