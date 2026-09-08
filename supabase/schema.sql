-- ============================================
-- Kanban Board Database Schema for Supabase
-- ============================================

-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Boards
CREATE TABLE boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Board Members
CREATE TABLE board_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

-- 4. Columns
CREATE TABLE columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Labels
CREATE TABLE labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1'
);

-- 6. Cards
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE NOT NULL,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INT NOT NULL DEFAULT 0,
  assignee_id UUID REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Card Labels (many-to-many)
CREATE TABLE card_labels (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Profiles: public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: update own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles: insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Boards: only owner and members can access
CREATE POLICY "Boards: member read" ON boards
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Boards: owner insert" ON boards FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Boards: owner update" ON boards FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Boards: owner delete" ON boards FOR DELETE USING (auth.uid() = owner_id);

-- Board Members
CREATE POLICY "BoardMembers: read" ON board_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );
CREATE POLICY "BoardMembers: owner insert" ON board_members
  FOR INSERT WITH CHECK (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );
CREATE POLICY "BoardMembers: owner delete" ON board_members
  FOR DELETE USING (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

-- Columns: accessible by board members
CREATE POLICY "Columns: member read" ON columns
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Columns: member insert" ON columns
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Columns: member update" ON columns
  FOR UPDATE USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Columns: member delete" ON columns
  FOR DELETE USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );

-- Cards: accessible by board members
CREATE POLICY "Cards: member read" ON cards
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Cards: member insert" ON cards
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Cards: member update" ON cards
  FOR UPDATE USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Cards: member delete" ON cards
  FOR DELETE USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );

-- Labels: accessible by board members
CREATE POLICY "Labels: member read" ON labels
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Labels: member all" ON labels
  FOR ALL USING (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

-- Card Labels
CREATE POLICY "CardLabels: member read" ON card_labels
  FOR SELECT USING (
    card_id IN (
      SELECT id FROM cards WHERE board_id IN (
        SELECT id FROM boards WHERE owner_id = auth.uid()
        UNION
        SELECT board_id FROM board_members WHERE user_id = auth.uid()
      )
    )
  );
CREATE POLICY "CardLabels: member all" ON card_labels
  FOR ALL USING (
    card_id IN (
      SELECT id FROM cards WHERE board_id IN (
        SELECT id FROM boards WHERE owner_id = auth.uid()
        UNION
        SELECT board_id FROM board_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-add owner as board member on board creation
CREATE OR REPLACE FUNCTION handle_board_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO board_members (board_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');

  -- Create default columns
  INSERT INTO columns (board_id, name, position) VALUES
    (NEW.id, 'To Do', 0),
    (NEW.id, 'In Progress', 1),
    (NEW.id, 'Done', 2);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_board_created
  AFTER INSERT ON boards
  FOR EACH ROW EXECUTE FUNCTION handle_board_created();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
