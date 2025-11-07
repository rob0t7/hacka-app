'use client';

interface Comment {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (comments.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-8">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong className="text-gray-900 dark:text-gray-100">
              {comment.username}
            </strong>
            <span className="mx-2">•</span>
            <span>{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
