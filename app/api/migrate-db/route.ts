import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Drop and recreate the mode constraint to include team-random
    await sql`
      ALTER TABLE hackathons
      DROP CONSTRAINT IF EXISTS hackathons_mode_check
    `;

    await sql`
      ALTER TABLE hackathons
      ADD CONSTRAINT hackathons_mode_check CHECK(mode IN ('select', 'random', 'team-random'))
    `;

    // Create hackathon_participants table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS hackathon_participants (
        id SERIAL PRIMARY KEY,
        hackathon_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(hackathon_id, user_id),
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    return NextResponse.json({ message: 'Database migrated successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate database', details: error },
      { status: 500 }
    );
  }
}
