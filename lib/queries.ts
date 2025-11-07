import { sql } from './db';

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
export async function createUser(username: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (username)
    VALUES (${username})
    RETURNING *
  `;
  return result.rows[0] as User;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result.rows[0] as User | null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await sql`SELECT * FROM users WHERE username = ${username}`;
  return result.rows[0] as User | null;
}

export async function getOrCreateUser(username: string): Promise<User> {
  let user = await getUserByUsername(username);
  if (!user) {
    user = await createUser(username);
  }
  return user;
}

// Idea operations
export async function createIdea(title: string, description: string, userId: number): Promise<Idea | null> {
  const result = await sql`
    INSERT INTO ideas (title, description, user_id)
    VALUES (${title}, ${description}, ${userId})
    RETURNING id
  `;
  const ideaId = result.rows[0].id;
  return getIdeaById(ideaId);
}

export async function getIdeaById(id: number, userId?: number): Promise<Idea | null> {
  let result;

  if (userId) {
    result = await sql`
      SELECT
        i.*,
        u.username,
        COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(v.vote_type), 0) as score,
        uv.vote_type as userVote
      FROM ideas i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN votes v ON i.id = v.idea_id
      LEFT JOIN votes uv ON i.id = uv.idea_id AND uv.user_id = ${userId}
      WHERE i.id = ${id}
      GROUP BY i.id, i.title, i.description, i.user_id, i.created_at, u.username, uv.vote_type
    `;
  } else {
    result = await sql`
      SELECT
        i.*,
        u.username,
        COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(v.vote_type), 0) as score
      FROM ideas i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN votes v ON i.id = v.idea_id
      WHERE i.id = ${id}
      GROUP BY i.id, i.title, i.description, i.user_id, i.created_at, u.username
    `;
  }

  return result.rows[0] as Idea | null;
}

export async function getAllIdeas(userId?: number): Promise<Idea[]> {
  let result;

  if (userId) {
    result = await sql`
      SELECT
        i.*,
        u.username,
        COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(v.vote_type), 0) as score,
        uv.vote_type as userVote
      FROM ideas i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN votes v ON i.id = v.idea_id
      LEFT JOIN votes uv ON i.id = uv.idea_id AND uv.user_id = ${userId}
      GROUP BY i.id, i.title, i.description, i.user_id, i.created_at, u.username, uv.vote_type
      ORDER BY score DESC, i.created_at DESC
    `;
  } else {
    result = await sql`
      SELECT
        i.*,
        u.username,
        COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(v.vote_type), 0) as score
      FROM ideas i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN votes v ON i.id = v.idea_id
      GROUP BY i.id, i.title, i.description, i.user_id, i.created_at, u.username
      ORDER BY score DESC, i.created_at DESC
    `;
  }

  return result.rows as Idea[];
}

// Comment operations
export async function createComment(ideaId: number, userId: number, content: string): Promise<Comment | null> {
  const result = await sql`
    INSERT INTO comments (idea_id, user_id, content)
    VALUES (${ideaId}, ${userId}, ${content})
    RETURNING id
  `;
  const commentId = result.rows[0].id;
  return getCommentById(commentId);
}

export async function getCommentById(id: number): Promise<Comment | null> {
  const result = await sql`
    SELECT c.*, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ${id}
  `;
  return result.rows[0] as Comment | null;
}

export async function getCommentsByIdeaId(ideaId: number): Promise<Comment[]> {
  const result = await sql`
    SELECT c.*, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.idea_id = ${ideaId}
    ORDER BY c.created_at ASC
  `;
  return result.rows as Comment[];
}

// Vote operations
export async function upsertVote(ideaId: number, userId: number, voteType: number): Promise<Idea | null> {
  await sql`
    INSERT INTO votes (idea_id, user_id, vote_type)
    VALUES (${ideaId}, ${userId}, ${voteType})
    ON CONFLICT (idea_id, user_id)
    DO UPDATE SET vote_type = EXCLUDED.vote_type
  `;
  return getIdeaById(ideaId, userId);
}

export async function removeVote(ideaId: number, userId: number): Promise<Idea | null> {
  await sql`DELETE FROM votes WHERE idea_id = ${ideaId} AND user_id = ${userId}`;
  return getIdeaById(ideaId, userId);
}
