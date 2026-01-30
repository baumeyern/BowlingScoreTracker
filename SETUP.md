# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   Find these in: Supabase Dashboard → Your Project → Settings → API

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

## 📊 Initial Data Setup

### Create Your First Week

Once the app is running, you'll need to add bowlers and weeks through the Supabase dashboard or via SQL:

```sql
-- Add your 4 bowlers
INSERT INTO bowlers (name, nickname, pin_code, avatar_color) VALUES
  ('Your Name', 'Nickname', '1234', '#3B82F6'),
  ('Teammate 2', 'Nick2', '2345', '#10B981'),
  ('Teammate 3', 'Nick3', '3456', '#F59E0B'),
  ('Teammate 4', 'Nick4', '4567', '#EF4444');

-- Create the current week
INSERT INTO weeks (week_number, bowling_date, is_complete, predictions_locked) VALUES
  (1, CURRENT_DATE, false, false);
```

## 🎯 Using the App

1. **Enter Scores**: Navigate to "Scores" → Select week → Enter 3 games for each bowler
2. **Make Predictions**: Go to "Predictions" → Predict teammates' series totals
3. **View Stats**: Check "Stats" for charts and analytics
4. **See History**: "History" shows all past weeks
5. **Leaderboard**: See who's winning the prediction game

## 🔧 Troubleshooting

**Can't see data?**
- Make sure Supabase credentials are correct in `.env`
- Check that tables are created in Supabase
- Verify RLS policies allow access

**Build errors?**
- Delete `node_modules` and run `npm install` again
- Make sure you're using Node.js 18 or higher

**Need help?**
- Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review the [README.md](./README.md)

## 📱 Production Deployment

Ready to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment instructions.
