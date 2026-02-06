-- Work Tracker Database Schema
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT 'blue',
  icon VARCHAR(100) DEFAULT 'folder',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Work Sessions Table
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily Statistics Table (for performance optimization)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Weekly Goals Table
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  target_hours INTEGER DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_id ON work_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_project_id ON work_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_start_time ON work_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_work_sessions_status ON work_sessions(status);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week ON weekly_goals(user_id, week_start_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at BEFORE UPDATE ON work_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_goals_updated_at BEFORE UPDATE ON weekly_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate session duration on end
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_duration_on_update BEFORE UPDATE ON work_sessions
  FOR EACH ROW EXECUTE FUNCTION calculate_session_duration();

-- Insert default weekly goal for new users
CREATE OR REPLACE FUNCTION create_default_weekly_goal()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO weekly_goals (user_id, week_start_date, target_hours)
  VALUES (NEW.id, DATE_TRUNC('week', CURRENT_DATE)::DATE, 40)
  ON CONFLICT (user_id, week_start_date) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_weekly_goal_on_user_create AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_weekly_goal();
