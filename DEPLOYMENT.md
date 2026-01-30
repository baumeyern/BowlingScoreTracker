# Deployment Guide

## Quick Setup (5 minutes)

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under Settings > API.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

## Database Setup (Already Completed)

You mentioned you've already run the Supabase scripts. The database should have:

- ✅ Tables: `bowlers`, `weeks`, `games`, `predictions`
- ✅ Views: `bowler_weekly_series`, `bowler_averages`, `prediction_accuracy`
- ✅ Row Level Security policies
- ✅ Indexes for performance

### Optional: Seed Test Data

If you haven't added the seed data yet, you can run this in your Supabase SQL Editor:

```sql
-- Insert the 4 bowlers
INSERT INTO bowlers (name, nickname, pin_code, avatar_color) VALUES
  ('Nick', 'Kingpin', '1234', '#3B82F6'),
  ('Mike', 'Spare Me', '2345', '#10B981'),
  ('Tom', 'Gutter Tom', '3456', '#F59E0B'),
  ('Dave', 'Big D', '4567', '#EF4444');

-- Insert weeks 1-5
INSERT INTO weeks (week_number, bowling_date, is_complete, predictions_locked) VALUES
  (1, '2024-10-18', true, true),
  (2, '2024-10-25', true, true),
  (3, '2024-11-01', true, true),
  (4, '2024-11-08', true, true),
  (5, '2024-11-15', false, false),
  (6, '2024-11-22', false, false);
```

You can add sample game scores as well following the pattern in the main prompt document.

## Deploy to Vercel

### Option 1: Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `baumeyern/BowlingScoreTracker`
4. Configure environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted, add your environment variables.

## Features Checklist

### Core Functionality ✅
- ✅ Bowler management
- ✅ Week creation and management
- ✅ Score entry for 3 games per bowler per week
- ✅ Edit historical weeks (backfill support)
- ✅ Running average calculation
- ✅ Handicap calculation (90% of 215)
- ✅ Series totals (scratch and with handicap)

### Prediction Mini-Game ✅
- ✅ Enter predictions for teammates
- ✅ Lock predictions mechanism
- ✅ Calculate prediction accuracy
- ✅ Points system for prediction accuracy
- ✅ Prediction game leaderboard
- ✅ Historical prediction accuracy stats

### Visualizations (Charts) ✅
- ✅ Average over time (line chart)
- ✅ Individual game scores over time
- ✅ Score distribution histogram
- ✅ Handicap trend over time
- ✅ Team comparison chart

### Statistics ✅
- ✅ Personal bests (high game, high series)
- ✅ Current average and handicap
- ✅ Games bowled count
- ✅ Week-over-week tracking

### UX Polish ✅
- ✅ Mobile-responsive design
- ✅ Bowler switching
- ✅ Loading states and skeletons
- ✅ Toast notifications for saves
- ✅ Real-time data with React Query

## Next Steps

1. **Test the application**: Open http://localhost:5173 and test all features
2. **Add your team's data**: Enter bowlers and start recording scores
3. **Customize**: Adjust colors, team name, etc. in the code
4. **Deploy**: Push to Vercel for production use

## Troubleshooting

### Can't connect to Supabase
- Check your `.env` file has correct credentials
- Verify RLS policies are set correctly (open access)
- Check Supabase project is active

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (need 18+)
- Clear cache: `rm -rf node_modules && npm install`

### Charts not showing
- Ensure you have data in the database
- Check browser console for errors
- Verify views are created in Supabase

## Support

For issues or questions, check:
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query)
- [shadcn/ui Documentation](https://ui.shadcn.com)
