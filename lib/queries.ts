import db from './db';

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  user_id: number;
  username: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote?: number | null;
}

export interface Comment {
  id: number;
  idea_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

// User operations
export function createUser(username: string): User {
  const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
  const result = stmt.run(username);
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserById(id: number): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export function getUserByUsername(username: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | null;
}

export function getOrCreateUser(username: string): User {
  let user = getUserByUsername(username);
  if (!user) {
    user = createUser(username);
  }
  return user;
}

// Idea operations
export function createIdea(title: string, description: string, userId: number) {
  const stmt = db.prepare('INSERT INTO ideas (title, description, user_id) VALUES (?, ?, ?)');
  const result = stmt.run(title, description, userId);
  return getIdeaById(result.lastInsertRowid as number);
}

export function getIdeaById(id: number, userId?: number): Idea | null {
  const stmt = db.prepare(`
    SELECT
      i.*,
      u.username,
      COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
      COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
      COALESCE(SUM(v.vote_type), 0) as score
      ${userId ? ', uv.vote_type as userVote' : ''}
    FROM ideas i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN votes v ON i.id = v.idea_id
    ${userId ? 'LEFT JOIN votes uv ON i.id = uv.idea_id AND uv.user_id = ?' : ''}
    WHERE i.id = ?
    GROUP BY i.id
  `);

  const params = userId ? [userId, id] : [id];
  return stmt.get(...params) as Idea | null;
}

export function getAllIdeas(userId?: number): Idea[] {
  const stmt = db.prepare(`
    SELECT
      i.*,
      u.username,
      COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
      COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
      COALESCE(SUM(v.vote_type), 0) as score
      ${userId ? ', uv.vote_type as userVote' : ''}
    FROM ideas i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN votes v ON i.id = v.idea_id
    ${userId ? 'LEFT JOIN votes uv ON i.id = uv.idea_id AND uv.user_id = ?' : ''}
    GROUP BY i.id
    ORDER BY score DESC, i.created_at DESC
  `);

  return userId ? stmt.all(userId) as Idea[] : stmt.all() as Idea[];
}

// Comment operations
export function createComment(ideaId: number, userId: number, content: string) {
  const stmt = db.prepare('INSERT INTO comments (idea_id, user_id, content) VALUES (?, ?, ?)');
  const result = stmt.run(ideaId, userId, content);
  return getCommentById(result.lastInsertRowid as number);
}

export function getCommentById(id: number): Comment | null {
  const stmt = db.prepare(`
    SELECT c.*, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `);
  return stmt.get(id) as Comment | null;
}

export function getCommentsByIdeaId(ideaId: number): Comment[] {
  const stmt = db.prepare(`
    SELECT c.*, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.idea_id = ?
    ORDER BY c.created_at ASC
  `);
  return stmt.all(ideaId) as Comment[];
}

// Vote operations
export function upsertVote(ideaId: number, userId: number, voteType: number) {
  const stmt = db.prepare(`
    INSERT INTO votes (idea_id, user_id, vote_type)
    VALUES (?, ?, ?)
    ON CONFLICT(idea_id, user_id)
    DO UPDATE SET vote_type = excluded.vote_type
  `);
  stmt.run(ideaId, userId, voteType);
  return getIdeaById(ideaId, userId);
}

export function removeVote(ideaId: number, userId: number) {
  const stmt = db.prepare('DELETE FROM votes WHERE idea_id = ? AND user_id = ?');
  stmt.run(ideaId, userId);
  return getIdeaById(ideaId, userId);
}
