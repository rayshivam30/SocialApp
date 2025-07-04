# Social Media App

A modern, full-stack social media application built with Next.js, TypeScript, and Tailwind CSS. This project features user authentication, posts, comments, communities, direct messaging, and more.

## Features

- User authentication (signup, login, logout)
- Create, join, and manage communities
- Create, like, and comment on posts
- Direct messaging between users
- User profiles and settings
- Search for users, posts, and communities
- Responsive design for mobile and desktop
- Real-time messaging powered by Socket.IO

## Tech Stack

- **Frontend & Backend:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** (Add your DB, e.g., PostgreSQL, SQLite)
- **ORM:** (Add your ORM, e.g., Prisma, Drizzle)
- **Authentication:** (Add your auth provider, e.g., NextAuth.js, custom)
- **Real-time Communication:** [Socket.IO](https://socket.io/) (for live messaging and updates)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd social-media-app
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values.

4. **Set up the database:**
   - Run the SQL scripts in the `scripts/` directory to create tables and seed data.
   - Example (using psql):
     ```bash
     psql -U <user> -d <database> -f scripts/01-create-tables.sql
     ```

5. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/                # Next.js app directory (routes, pages, API)
components/         # Reusable UI and feature components
hooks/              # Custom React hooks
lib/                # Utility libraries (auth, db, etc.)
scripts/            # SQL scripts for database setup and seeding
public/             # Static assets (images, logos)
styles/             # Global styles
```

## Scripts

- `pnpm dev` / `npm run dev` — Start the development server
- `pnpm build` / `npm run build` — Build for production
- `pnpm start` / `npm start` — Start the production server

## Contributing

Contributions are welcome! Please open issues and submit pull requests for new features, bug fixes, or improvements.
