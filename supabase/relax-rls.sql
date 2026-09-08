-- ============================================
-- Relax RLS Policies for Public Access
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Boards: allow public read/write
DROP POLICY IF EXISTS "Boards: member read" ON boards;
DROP POLICY IF EXISTS "Boards: owner insert" ON boards;
DROP POLICY IF EXISTS "Boards: owner update" ON boards;
DROP POLICY IF EXISTS "Boards: owner delete" ON boards;

CREATE POLICY "Boards: public read" ON boards FOR SELECT USING (true);
CREATE POLICY "Boards: public insert" ON boards FOR INSERT WITH CHECK (true);
CREATE POLICY "Boards: public update" ON boards FOR UPDATE USING (true);
CREATE POLICY "Boards: public delete" ON boards FOR DELETE USING (true);

-- Board Members: allow public read/write
DROP POLICY IF EXISTS "BoardMembers: read" ON board_members;
DROP POLICY IF EXISTS "BoardMembers: owner insert" ON board_members;
DROP POLICY IF EXISTS "BoardMembers: owner delete" ON board_members;

CREATE POLICY "BoardMembers: public read" ON board_members FOR SELECT USING (true);
CREATE POLICY "BoardMembers: public insert" ON board_members FOR INSERT WITH CHECK (true);
CREATE POLICY "BoardMembers: public delete" ON board_members FOR DELETE USING (true);

-- Columns: allow public read/write
DROP POLICY IF EXISTS "Columns: member read" ON columns;
DROP POLICY IF EXISTS "Columns: member insert" ON columns;
DROP POLICY IF EXISTS "Columns: member update" ON columns;
DROP POLICY IF EXISTS "Columns: member delete" ON columns;

CREATE POLICY "Columns: public read" ON columns FOR SELECT USING (true);
CREATE POLICY "Columns: public insert" ON columns FOR INSERT WITH CHECK (true);
CREATE POLICY "Columns: public update" ON columns FOR UPDATE USING (true);
CREATE POLICY "Columns: public delete" ON columns FOR DELETE USING (true);

-- Cards: allow public read/write
DROP POLICY IF EXISTS "Cards: member read" ON cards;
DROP POLICY IF EXISTS "Cards: member insert" ON cards;
DROP POLICY IF EXISTS "Cards: member update" ON cards;
DROP POLICY IF EXISTS "Cards: member delete" ON cards;

CREATE POLICY "Cards: public read" ON cards FOR SELECT USING (true);
CREATE POLICY "Cards: public insert" ON cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Cards: public update" ON cards FOR UPDATE USING (true);
CREATE POLICY "Cards: public delete" ON cards FOR DELETE USING (true);

-- Labels: allow public read/write
DROP POLICY IF EXISTS "Labels: member read" ON labels;
DROP POLICY IF EXISTS "Labels: member all" ON labels;

CREATE POLICY "Labels: public read" ON labels FOR SELECT USING (true);
CREATE POLICY "Labels: public all" ON labels FOR ALL USING (true);

-- Card Labels: allow public read/write
DROP POLICY IF EXISTS "CardLabels: member read" ON card_labels;
DROP POLICY IF EXISTS "CardLabels: member all" ON card_labels;

CREATE POLICY "CardLabels: public read" ON card_labels FOR SELECT USING (true);
CREATE POLICY "CardLabels: public all" ON card_labels FOR ALL USING (true);

-- Profiles: allow public read/insert/update
DROP POLICY IF EXISTS "Profiles: public read" ON profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON profiles;
DROP POLICY IF EXISTS "Profiles: insert own" ON profiles;

CREATE POLICY "Profiles: public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: public insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles: public update" ON profiles FOR UPDATE USING (true);
