-- redSpec.AI Database Schema
-- PostgreSQL schema for PRD storage and management

-- PRDs table
CREATE TABLE IF NOT EXISTS prds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sections JSONB, -- Store PRD sections as JSON
    status VARCHAR(50) DEFAULT 'draft', -- draft, in_review, approved
    template VARCHAR(50) DEFAULT 'standard', -- standard, mvp, enhancement, integration
    github_repo VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255), -- User identifier (can be email or username)
    metadata JSONB -- Additional metadata like story points, validation score, etc.
);

-- Conversations table (for chat history)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prd_id UUID REFERENCES prds(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Additional data like question options, etc.
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prds_created_at ON prds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prds_status ON prds(status);
CREATE INDEX IF NOT EXISTS idx_prds_created_by ON prds(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_prd_id ON conversations(prd_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_prds_updated_at BEFORE UPDATE ON prds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

