-- Migration: Add profile picture support
-- Run this in your Supabase SQL editor

-- 1. Add profile_picture_url column to bowlers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bowlers' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE bowlers ADD COLUMN profile_picture_url TEXT;
  END IF;
END $$;

-- 2. Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Allow public read access to profile pictures
DROP POLICY IF EXISTS "Public read profile pictures" ON storage.objects;
CREATE POLICY "Public read profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- 4. Allow anyone to upload profile pictures
DROP POLICY IF EXISTS "Allow upload profile pictures" ON storage.objects;
CREATE POLICY "Allow upload profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures');

-- 5. Allow anyone to update/overwrite profile pictures
DROP POLICY IF EXISTS "Allow update profile pictures" ON storage.objects;
CREATE POLICY "Allow update profile pictures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures');

-- 6. Allow anyone to delete profile pictures
DROP POLICY IF EXISTS "Allow delete profile pictures" ON storage.objects;
CREATE POLICY "Allow delete profile pictures"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures');
