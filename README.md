# Bowling League Tracker

A production-ready React web application for tracking bowling league scores, calculating handicaps, and running a prediction mini-game.

## Features

- 📊 **Score Tracking**: Enter and manage weekly bowling scores for your 4-person team
- 📈 **Statistics & Analytics**: View averages, handicaps, and performance trends
- 🎯 **Prediction Game**: Predict teammates' scores and compete for accuracy points
- 📱 **Mobile-Friendly**: Optimized for quick data entry at the bowling alley
- 🔄 **Real-Time Sync**: Live updates across all team members
- 📉 **Visualizations**: Multiple charts showing performance trends

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: TailwindCSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **State**: TanStack Query (React Query)
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/baumeyern/BowlingScoreTracker.git
cd BowlingScoreTracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Database Setup

The database schema and seed data are included in the project documentation. Run the provided SQL scripts in your Supabase SQL editor.

## Deployment

This app is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Handicap System

The league uses a standard handicap formula:
- **Handicap = 90% of (220 - average)**
- This helps level the playing field between bowlers of different skill levels

## Prediction Game

Each week, bowlers predict their teammates' 3-game series totals:
- **Exact match**: 10 points
- **Within 10 pins**: 7 points
- **Within 25 pins**: 5 points
- **Within 50 pins**: 3 points
- **Within 75 pins**: 1 point

The bowler with the most prediction points wins!

## License

MIT
