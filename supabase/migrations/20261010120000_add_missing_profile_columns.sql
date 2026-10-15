-- Add missing profile columns
-- This migration adds provider, preferences, and avatar_url columns to profiles table

-- Add provider column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- Add preferences column (JSONB for flexible settings)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme": "system", "auto_save": true, "notifications": {}}';

-- Add avatar_url column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add full_name column if not exists (should exist but adding for safety)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update the updated_at trigger to also update on profile changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);