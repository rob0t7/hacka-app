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

// Hackathon interfaces
export interface Hackathon {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: number;
  creator_username: string;
  created_at: string;
  idea_count?: number;
  team_count?: number;
}

export interface Team {
  id: number;
  name: string;
  hackathon_id: number;
  idea_id: number | null;
  idea_title?: string | null;
  created_by: number;
  creator_username: string;
  created_at: string;
  member_count?: number;
  members?: string[];
}

// Hackathon operations
export async function createHackathon(
  name: string,
  description: string | null,
  startDate: string | null,
  endDate: string | null,
  userId: number
): Promise<Hackathon> {
  const result = await sql`
    INSERT INTO hackathons (name, description, start_date, end_date, created_by)
    VALUES (${name}, ${description}, ${startDate}, ${endDate}, ${userId})
    RETURNING id
  `;
  const hackathonId = result.rows[0].id;
  const hackathon = await getHackathonById(hackathonId);
  return hackathon!;
}

export async function getHackathonById(id: number): Promise<Hackathon | null> {
  const result = await sql`
    SELECT
      h.*,
      u.username as creator_username,
      COUNT(DISTINCT hi.idea_id) as idea_count,
      COUNT(DISTINCT t.id) as team_count
    FROM hackathons h
    JOIN users u ON h.created_by = u.id
    LEFT JOIN hackathon_ideas hi ON h.id = hi.hackathon_id
    LEFT JOIN teams t ON h.id = t.hackathon_id
    WHERE h.id = ${id}
    GROUP BY h.id, h.name, h.description, h.start_date, h.end_date, h.created_by, h.created_at, u.username
  `;
  return result.rows[0] as Hackathon | null;
}

export async function getAllHackathons(): Promise<Hackathon[]> {
  const result = await sql`
    SELECT
      h.*,
      u.username as creator_username,
      COUNT(DISTINCT hi.idea_id) as idea_count,
      COUNT(DISTINCT t.id) as team_count
    FROM hackathons h
    JOIN users u ON h.created_by = u.id
    LEFT JOIN hackathon_ideas hi ON h.id = hi.hackathon_id
    LEFT JOIN teams t ON h.id = t.hackathon_id
    GROUP BY h.id, h.name, h.description, h.start_date, h.end_date, h.created_by, h.created_at, u.username
    ORDER BY h.created_at DESC
  `;
  return result.rows as Hackathon[];
}

export async function addIdeaToHackathon(hackathonId: number, ideaId: number): Promise<void> {
  await sql`
    INSERT INTO hackathon_ideas (hackathon_id, idea_id)
    VALUES (${hackathonId}, ${ideaId})
    ON CONFLICT (hackathon_id, idea_id) DO NOTHING
  `;
}

export async function removeIdeaFromHackathon(hackathonId: number, ideaId: number): Promise<void> {
  await sql`
    DELETE FROM hackathon_ideas
    WHERE hackathon_id = ${hackathonId} AND idea_id = ${ideaId}
  `;
}

export async function getHackathonIdeas(hackathonId: number): Promise<Idea[]> {
  const result = await sql`
    SELECT
      i.*,
      u.username,
      COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
      COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
      COALESCE(SUM(v.vote_type), 0) as score
    FROM hackathon_ideas hi
    JOIN ideas i ON hi.idea_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN votes v ON i.id = v.idea_id
    WHERE hi.hackathon_id = ${hackathonId}
    GROUP BY i.id, i.title, i.description, i.user_id, i.created_at, u.username
    ORDER BY score DESC, i.created_at DESC
  `;
  return result.rows as Idea[];
}

// Team operations
export async function createTeam(
  name: string,
  hackathonId: number,
  ideaId: number | null,
  userId: number
): Promise<Team> {
  const result = await sql`
    INSERT INTO teams (name, hackathon_id, idea_id, created_by)
    VALUES (${name}, ${hackathonId}, ${ideaId}, ${userId})
    RETURNING id
  `;
  const teamId = result.rows[0].id;

  // Automatically add creator as team member
  await addTeamMember(teamId, userId);

  const team = await getTeamById(teamId);
  return team!;
}

export async function getTeamById(id: number): Promise<Team | null> {
  const result = await sql`
    SELECT
      t.*,
      u.username as creator_username,
      i.title as idea_title,
      COUNT(DISTINCT tm.user_id) as member_count
    FROM teams t
    JOIN users u ON t.created_by = u.id
    LEFT JOIN ideas i ON t.idea_id = i.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.id = ${id}
    GROUP BY t.id, t.name, t.hackathon_id, t.idea_id, t.created_by, t.created_at, u.username, i.title
  `;

  if (result.rows.length === 0) return null;

  const team = result.rows[0] as Team;

  // Get member usernames
  const membersResult = await sql`
    SELECT u.username
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ${id}
    ORDER BY tm.joined_at ASC
  `;
  team.members = membersResult.rows.map(row => row.username);

  return team;
}

export async function getTeamsByHackathon(hackathonId: number): Promise<Team[]> {
  const result = await sql`
    SELECT
      t.*,
      u.username as creator_username,
      i.title as idea_title,
      COUNT(DISTINCT tm.user_id) as member_count
    FROM teams t
    JOIN users u ON t.created_by = u.id
    LEFT JOIN ideas i ON t.idea_id = i.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.hackathon_id = ${hackathonId}
    GROUP BY t.id, t.name, t.hackathon_id, t.idea_id, t.created_by, t.created_at, u.username, i.title
    ORDER BY t.created_at DESC
  `;

  const teams = result.rows as Team[];

  // Get members for each team
  for (const team of teams) {
    const membersResult = await sql`
      SELECT u.username
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ${team.id}
      ORDER BY tm.joined_at ASC
    `;
    team.members = membersResult.rows.map(row => row.username);
  }

  return teams;
}

export async function addTeamMember(teamId: number, userId: number): Promise<void> {
  await sql`
    INSERT INTO team_members (team_id, user_id)
    VALUES (${teamId}, ${userId})
    ON CONFLICT (team_id, user_id) DO NOTHING
  `;
}

export async function removeTeamMember(teamId: number, userId: number): Promise<void> {
  await sql`
    DELETE FROM team_members
    WHERE team_id = ${teamId} AND user_id = ${userId}
  `;
}
