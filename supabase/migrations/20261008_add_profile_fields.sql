-- Add phone, phone_verified, and other profile fields to profiles table
-- This migration adds support for phone number verification and enhanced preferences

-- Add phone and phone_verified columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update preferences to include notification and privacy settings
-- The preferences column is JSONB, we'll just ensure it has the right structure in the app

-- Create an index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Enable RLS on storage.objects if not already enabled
-- (This is usually enabled by default in Supabase)

-- Create storage bucket for avatars if not exists
-- Note: This needs to be done in Supabase Dashboard or via SQL
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
-- Users can upload their own avatars
-- CREATE POLICY "Users can upload their own avatar" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own avatars
-- CREATE POLICY "Users can update their own avatar" ON storage.objects
-- FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own avatars
-- CREATE POLICY "Users can delete their own avatar" ON storage.objects
-- FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public can view avatars
-- CREATE POLICY "Public can view avatars" ON storage.objects
-- FOR SELECT USING (bucket_id = 'avatars');