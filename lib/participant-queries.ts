import { sql } from '@vercel/postgres';

// Hackathon participant operations
export async function addHackathonParticipant(hackathonId: number, userId: number): Promise<void> {
  await sql`
    INSERT INTO hackathon_participants (hackathon_id, user_id)
    VALUES (${hackathonId}, ${userId})
    ON CONFLICT (hackathon_id, user_id) DO NOTHING
  `;
}

export async function removeHackathonParticipant(hackathonId: number, userId: number): Promise<void> {
  await sql`
    DELETE FROM hackathon_participants
    WHERE hackathon_id = ${hackathonId} AND user_id = ${userId}
  `;
}

export async function getHackathonParticipants(hackathonId: number): Promise<string[]> {
  const result = await sql`
    SELECT u.username
    FROM hackathon_participants hp
    JOIN users u ON hp.user_id = u.id
    WHERE hp.hackathon_id = ${hackathonId}
    ORDER BY hp.joined_at ASC
  `;
  return result.rows.map(row => row.username);
}

export async function randomizeTeams(hackathonId: number, teamSize: number = 4): Promise<void> {
  // Get all participants
  const participantsResult = await sql`
    SELECT u.id, u.username
    FROM hackathon_participants hp
    JOIN users u ON hp.user_id = u.id
    WHERE hp.hackathon_id = ${hackathonId}
    ORDER BY RANDOM()
  `;

  const participants = participantsResult.rows;
  if (participants.length === 0) return;

  // Delete existing teams for this hackathon
  await sql`
    DELETE FROM teams
    WHERE hackathon_id = ${hackathonId}
  `;

  // Calculate number of teams needed for balanced distribution
  const numTeams = Math.ceil(participants.length / teamSize);

  // Create teams and assign participants in a balanced way
  for (let i = 0; i < numTeams; i++) {
    const teamName = 'Team ' + (i + 1);

    // Create team
    const teamResult = await sql`
      INSERT INTO teams (name, hackathon_id, created_by)
      VALUES (${teamName}, ${hackathonId}, ${participants[0].id})
      RETURNING id
    `;
    const teamId = teamResult.rows[0].id;

    // Assign participants to this team using round-robin for balance
    for (let j = i; j < participants.length; j += numTeams) {
      await sql`
        INSERT INTO team_members (team_id, user_id)
        VALUES (${teamId}, ${participants[j].id})
      `;
    }
  }
}
