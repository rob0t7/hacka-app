# Project Context & Development Summary

## Session Overview
**Date**: November 7, 2025
**Project**: Hackathon Ideas Sharing Webapp
**Status**: ✅ Completed and Running

---

## Initial Request

The user requested:
> "Create a webapp that allows users to share hackathon or other improvement ideas. The application should allow users to add a title, description to the ideas. Other users should be allowed to leave comments and up or down vote."

---

## Technology Decisions

### Initial Choices
After asking the user for preferences, we decided on:
- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Authentication**: Simple usernames (no passwords)

### Architecture Change
During development, the user requested to use **Next.js** instead of a separate React/Express setup. This simplified the architecture by:
- Combining frontend and backend in one project
- Using Next.js API routes instead of Express
- Leveraging Next.js App Router for routing
- Built-in TypeScript and Tailwind CSS support

---

## What Was Built

### Core Features Implemented

1. **Idea Submission**
   - Form with title and description fields
   - Simple username-based authentication (localStorage)
   - Ideas stored in SQLite database

2. **Voting System**
   - Upvote (▲) and downvote (▼) buttons
   - Vote counts displayed for each idea
   - Overall score calculation (upvotes - downvotes)
   - Toggle functionality (click same button to remove vote)
   - One vote per user per idea (enforced by database)

3. **Comments**
   - Comment form on idea detail pages
   - Display all comments with timestamps
   - Username attribution for each comment

4. **User Experience**
   - Homepage listing all ideas sorted by score
   - Individual idea detail pages
   - Responsive design with dark mode support
   - Loading states and error handling

---

## Project Structure

```
hackathon/
├── app/
│   ├── api/
│   │   ├── ideas/
│   │   │   ├── route.ts          # GET all ideas, POST new idea
│   │   │   └── [id]/route.ts     # GET single idea by ID
│   │   ├── comments/
│   │   │   └── route.ts          # GET comments by ideaId, POST new comment
│   │   └── votes/
│   │       └── route.ts          # POST vote (upvote/downvote/remove)
│   ├── ideas/
│   │   └── [id]/
│   │       └── page.tsx          # Idea detail page with comments
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Homepage with idea list
│   └── globals.css               # Tailwind CSS styles
├── components/
│   ├── CommentForm.tsx           # Form to add comments
│   ├── CommentList.tsx           # Display list of comments
│   ├── IdeaCard.tsx              # Card component for each idea
│   ├── IdeaForm.tsx              # Form to submit new ideas
│   └── VoteButtons.tsx           # Upvote/downvote buttons
├── lib/
│   ├── db.ts                     # SQLite database initialization
│   └── queries.ts                # Database query functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── README.md                     # User documentation
└── hackathon.db                  # SQLite database (auto-generated)
```

---

## Database Schema

### Tables

**users**
- `id` INTEGER PRIMARY KEY
- `username` TEXT UNIQUE NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

**ideas**
- `id` INTEGER PRIMARY KEY
- `title` TEXT NOT NULL
- `description` TEXT NOT NULL
- `user_id` INTEGER (FK → users.id)
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

**comments**
- `id` INTEGER PRIMARY KEY
- `idea_id` INTEGER (FK → ideas.id, CASCADE DELETE)
- `user_id` INTEGER (FK → users.id)
- `content` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

**votes**
- `id` INTEGER PRIMARY KEY
- `idea_id` INTEGER (FK → ideas.id, CASCADE DELETE)
- `user_id` INTEGER (FK → users.id)
- `vote_type` INTEGER CHECK(vote_type IN (-1, 1))
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- UNIQUE(idea_id, user_id)

### Key Design Decisions

1. **Vote Storage**: Using -1 for downvote and 1 for upvote allows easy score calculation with SUM()
2. **Unique Constraint**: One vote per user per idea prevents spam
3. **Cascade Delete**: Deleting an idea removes associated comments and votes
4. **Username System**: Simple text-based usernames without passwords (client-side storage)

---

## API Endpoints

### Ideas
```
GET  /api/ideas          → List all ideas with vote counts
POST /api/ideas          → Create new idea
  Body: { title, description, username }

GET  /api/ideas/[id]     → Get single idea with vote counts
```

### Comments
```
GET  /api/comments?ideaId=[id]  → Get all comments for an idea
POST /api/comments              → Create new comment
  Body: { ideaId, username, content }
```

### Votes
```
POST /api/votes          → Vote on an idea
  Body: { ideaId, username, voteType }
  voteType: 1 (upvote), -1 (downvote), 0 (remove vote)
```

---

## Key Components

### Frontend Components

**IdeaForm** (`components/IdeaForm.tsx`)
- Collects title and description
- Prompts for username on first use
- Stores username in localStorage
- Calls POST /api/ideas

**IdeaCard** (`components/IdeaCard.tsx`)
- Displays idea summary
- Shows vote buttons and score
- Links to detail page
- Shows author and date

**VoteButtons** (`components/VoteButtons.tsx`)
- Upvote/downvote buttons
- Displays vote counts
- Highlights user's current vote
- Toggle functionality

**CommentForm** (`components/CommentForm.tsx`)
- Text area for comment input
- Prompts for username if needed
- Calls POST /api/comments

**CommentList** (`components/CommentList.tsx`)
- Displays all comments for an idea
- Shows username and timestamp
- Empty state message

### Page Components

**Homepage** (`app/page.tsx`)
- Lists all ideas sorted by score
- Toggle button to show/hide idea form
- Fetches ideas on mount and after new submission
- Loading and empty states

**Idea Detail Page** (`app/ideas/[id]/page.tsx`)
- Shows full idea details
- Vote buttons
- Lists all comments
- Comment form at bottom
- Back button to homepage

---

## Implementation Details

### Authentication Approach
- No password system (as requested: "Simple usernames")
- Username stored in browser's localStorage
- Prompted on first interaction (voting, commenting, or posting)
- Persistent across page refreshes

### Vote Logic
```typescript
// If user clicks same vote button, remove vote (toggle off)
const finalVoteType = userVote === voteType ? 0 : voteType;

// Database uses UPSERT
INSERT INTO votes (idea_id, user_id, vote_type)
VALUES (?, ?, ?)
ON CONFLICT(idea_id, user_id)
DO UPDATE SET vote_type = excluded.vote_type
```

### Score Calculation
```sql
-- Aggregates votes for each idea
COALESCE(SUM(CASE WHEN v.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
COALESCE(SUM(CASE WHEN v.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
COALESCE(SUM(v.vote_type), 0) as score
```

---

## Development Process

### Build Steps Completed

1. ✅ Next.js project setup with TypeScript
2. ✅ SQLite database schema design
3. ✅ Database initialization and helper functions
4. ✅ API routes for ideas (GET, POST)
5. ✅ API routes for comments (GET, POST)
6. ✅ API routes for voting
7. ✅ React components (IdeaCard, IdeaForm, CommentList, VoteButtons)
8. ✅ Main page with idea list
9. ✅ Idea detail page with comments
10. ✅ Tailwind CSS styling
11. ✅ Testing and debugging

### Issues Resolved

**TypeScript Error in Dynamic Route**
- **Problem**: Next.js 15 changed params to be async (Promise-based)
- **Solution**: Updated route handler to await params
- **File**: `app/api/ideas/[id]/route.ts:6`

```typescript
// Before
{ params }: { params: { id: string } }

// After
{ params }: { params: Promise<{ id: string }> }
const { id } = await params;
```

---

## Current Status

### Running Application
- Development server: http://localhost:3000
- Build successful: ✅ No errors
- All features tested: ✅ Working

### Production Ready
```bash
npm run build   # ✅ Successful
npm start       # Ready for production
```

---

## Future Enhancement Ideas

Based on the current implementation, here are potential improvements:

1. **User Authentication**
   - Add password protection
   - JWT or session-based auth
   - User profiles

2. **Rich Content**
   - Markdown support for descriptions
   - Image uploads
   - Code syntax highlighting

3. **Organization**
   - Categories/tags for ideas
   - Search functionality
   - Filter by date, score, or category

4. **Social Features**
   - Reply to comments
   - Mention other users (@username)
   - Follow users or ideas

5. **Moderation**
   - Edit/delete own posts
   - Report inappropriate content
   - Admin dashboard

6. **Notifications**
   - Email alerts for comments
   - Browser push notifications
   - Activity feed

7. **Analytics**
   - Trending ideas
   - User contribution stats
   - Export data to CSV/JSON

8. **Deployment**
   - Environment variables for config
   - Production database (PostgreSQL)
   - Docker containerization
   - Deploy to Vercel/Railway/Fly.io

---

## Usage Instructions

### For Developers

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### For Users

1. **First time**: Enter a username when prompted
2. **Post an idea**: Click "+ New Idea" button
3. **Vote**: Click ▲ to upvote or ▼ to downvote
4. **Comment**: Click on an idea, scroll down, and add a comment
5. **View details**: Click on any idea title to see full description and comments

---

## Technical Notes

### Dependencies
- `next@^15.0.0` - React framework
- `react@^18.3.1` - UI library
- `better-sqlite3@^11.0.0` - SQLite database driver
- `tailwindcss@^3.4.1` - CSS framework
- `typescript@^5` - Type safety

### Database Location
- File: `hackathon.db` (root directory)
- Auto-created on first API call
- Persists between server restarts

### Browser Storage
- Username: `localStorage.getItem('username')`
- Cleared by user's browser settings

---

## Conclusion

This project successfully implements a full-stack web application for sharing and voting on hackathon ideas. The codebase is well-structured, type-safe, and ready for further development or deployment.

**Total Development Time**: ~1 session
**Files Created**: 23
**Lines of Code**: ~1,200+
**Test Status**: ✅ All features working
