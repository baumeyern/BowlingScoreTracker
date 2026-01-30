# Database Migration Guide

## 🔄 Migration: Predictions from Series to Individual Games

The predictions system has been updated to predict **individual game scores** (3 predictions per bowler) instead of series totals (1 prediction per bowler).

### Why This Change?

- More granular predictions (predict each game separately)
- More engaging mini-game (3x more predictions!)
- Better scoring opportunities
- More accurate to actual bowling (games vary significantly)

### ⚠️ Important: Run This Migration

**You MUST run this SQL migration in your Supabase SQL Editor** before using the updated app.

### How to Run the Migration

1. **Go to Supabase Dashboard**
   - Open your project at supabase.com
   - Navigate to: SQL Editor

2. **Copy the Migration SQL**
   - Open the file: `supabase-migration-game-predictions.sql` in this repo
   - Copy all the SQL code

3. **Run in SQL Editor**
   - Paste the SQL into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter
   - You should see: "Success. No rows returned"

4. **Verify Migration**
   ```sql
   -- Run this to verify the new structure
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'predictions';
   ```
   
   You should see:
   - `game_number` (integer)
   - `predicted_score` (integer, 0-300 range)
   - NO `predicted_series`

### What Changed

#### Before (Series Predictions):
- Predict one number per bowler (3-game series total)
- Range: 0-900 pins
- 3 predictions total per week

#### After (Game Predictions):
- Predict three numbers per bowler (individual games)
- Range: 0-300 pins per game
- 9 predictions total per week

### New Prediction UI

When you make predictions now, you'll see:

```
┌─────────────────────────────────────┐
│  Mike                               │
│  ┌───────┐ ┌───────┐ ┌───────┐     │
│  │  165  │ │  172  │ │  168  │     │
│  │Game 1 │ │Game 2 │ │Game 3 │     │
│  └───────┘ └───────┘ └───────┘     │
│  💡 Predicted series: 505           │
└─────────────────────────────────────┘
```

### Scoring Remains the Same

Points are awarded per game prediction:
- Exact: 10 points
- ±10 pins: 7 points  
- ±25 pins: 5 points
- ±50 pins: 3 points
- ±75 pins: 1 point

**Total possible points per week**: 90 points (10 pts × 3 games × 3 bowlers)

### ⚠️ Data Loss Warning

**This migration will DELETE all existing predictions!**

If you have important prediction data you want to keep, export it first:

```sql
-- Export existing predictions before migration
SELECT * FROM predictions;
```

Then save the results somewhere safe.

### Troubleshooting

**If you see errors after migration:**

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Restart dev server**: Stop and run `npm run dev` again
3. **Check migration ran**: Verify the predictions table has `game_number` column

**If migration fails:**

- Make sure you copied the ENTIRE SQL file
- Check for any existing database locks
- Try running it section by section

### Ready to Use

After running the migration:
1. ✅ Refresh your browser
2. ✅ Go to Predictions page
3. ✅ You'll see 3 input boxes per bowler now
4. ✅ Start predicting individual games!

---

**Questions?** Check the main DEPLOYMENT.md or SETUP.md guides.
