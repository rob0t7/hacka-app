import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Add mode column to hackathons table if it doesn't exist
    await sql`
      ALTER TABLE hackathons
      ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'select' CHECK(mode IN ('select', 'random'))
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
