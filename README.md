# Hackathon Ideas Webapp

A web application for sharing and voting on hackathon and improvement ideas. Built with Next.js, TypeScript, SQLite, and Tailwind CSS.

## Features

- **Share Ideas**: Create posts with a title and description
- **Voting System**: Upvote or downvote ideas you like or dislike
- **Comments**: Leave feedback and discuss ideas
- **Simple Authentication**: Username-based system (stored in browser localStorage)
- **Real-time Scoring**: Ideas are sorted by their vote score
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React with Next.js 15 (App Router)
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### First Time Use

When you first interact with the app (posting an idea, voting, or commenting), you'll be prompted to enter a username. This username is stored in your browser's localStorage and will be used for all future actions.

### Creating an Idea

1. Click the "+ New Idea" button on the homepage
2. Fill in the title and description
3. Click "Submit Idea"

### Voting

- Click the ▲ button to upvote an idea
- Click the ▼ button to downvote an idea
- Click the same button again to remove your vote

### Commenting

1. Click on an idea to view its details
2. Scroll to the bottom of the page
3. Enter your comment in the text area
4. Click "Post Comment"

## Project Structure

```
.
├── app/
│   ├── api/              # API routes
│   │   ├── ideas/        # Ideas endpoints
│   │   ├── comments/     # Comments endpoints
│   │   └── votes/        # Voting endpoints
│   ├── ideas/[id]/       # Idea detail page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── CommentForm.tsx
│   ├── CommentList.tsx
│   ├── IdeaCard.tsx
│   ├── IdeaForm.tsx
│   └── VoteButtons.tsx
├── lib/                  # Utility functions
│   ├── db.ts            # Database initialization
│   └── queries.ts       # Database queries
└── hackathon.db         # SQLite database (auto-generated)
```

## Database Schema

### Users
- id (PRIMARY KEY)
- username (UNIQUE)
- created_at

### Ideas
- id (PRIMARY KEY)
- title
- description
- user_id (FOREIGN KEY)
- created_at

### Comments
- id (PRIMARY KEY)
- idea_id (FOREIGN KEY)
- user_id (FOREIGN KEY)
- content
- created_at

### Votes
- id (PRIMARY KEY)
- idea_id (FOREIGN KEY)
- user_id (FOREIGN KEY)
- vote_type (1 for upvote, -1 for downvote)
- created_at
- UNIQUE constraint on (idea_id, user_id)

## API Endpoints

### Ideas
- `GET /api/ideas` - Get all ideas
- `POST /api/ideas` - Create a new idea
- `GET /api/ideas/[id]` - Get a specific idea

### Comments
- `GET /api/comments?ideaId=[id]` - Get comments for an idea
- `POST /api/comments` - Create a new comment

### Votes
- `POST /api/votes` - Vote on an idea (voteType: 1, -1, or 0 to remove)

## Features to Add

Here are some ideas for future enhancements:

- User profiles and authentication
- Image uploads for ideas
- Tags/categories for ideas
- Search and filter functionality
- Email notifications
- Edit/delete functionality
- Markdown support for descriptions
- Social sharing

## License

MIT
