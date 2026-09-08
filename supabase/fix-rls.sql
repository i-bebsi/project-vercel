-- ============================================
-- Fix: Drop problematic trigger & relax RLS
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Drop the trigger that causes signup failure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Drop ALL existing policies
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3. Create permissive policies for ALL tables
CREATE POLICY "allow_all" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON boards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON board_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON labels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON card_labels FOR ALL USING (true) WITH CHECK (true);

-- 4. Create a simpler trigger for profiles (optional, can skip)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
