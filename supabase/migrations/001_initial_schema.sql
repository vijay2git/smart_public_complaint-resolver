-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('citizen', 'admin')) DEFAULT 'citizen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  ai_severity_score DECIMAL(3,2) DEFAULT 0.5,
  priority_score INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'escalated', 'resolved', 'closed')) DEFAULT 'pending',
  location JSONB,
  images TEXT[],
  voice_transcription TEXT,
  ai_classification JSONB,
  duplicate_of UUID REFERENCES complaints(id),
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ
);

-- Create index for similarity search
CREATE INDEX ON complaints USING ivfflat (embedding vector_cosine_ops);

-- Status history table
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('email', 'sms')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at 
  BEFORE UPDATE ON complaints 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to find similar complaints
CREATE OR REPLACE FUNCTION find_similar_complaints(
  query_embedding vector(1536),
  threshold FLOAT DEFAULT 0.8,
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.category,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM complaints c
  WHERE c.embedding IS NOT NULL
    AND c.status NOT IN ('resolved', 'closed')
    AND 1 - (c.embedding <=> query_embedding) > threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Index for faster lookups
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_priority_score ON complaints(priority_score DESC);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_status_history_complaint_id ON status_history(complaint_id);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Complaints policies
CREATE POLICY "Citizens can view own complaints" ON complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Citizens can create complaints" ON complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints" ON complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all complaints" ON complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Status history policies
CREATE POLICY "Users can view complaint status history" ON status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_id 
      AND (c.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
