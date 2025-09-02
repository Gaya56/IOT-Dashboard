-- Migration: create_event_embeddings_table
-- Applied: 2025-09-01
-- Purpose: Create table for storing 384-D embeddings of IoT events

-- Enable vector extension if not already enabled
create extension if not exists vector;

-- Create event_embeddings table with FK to iot_events
create table if not exists public.event_embeddings (
  event_id bigint primary key
    references public.iot_events(id) on delete cascade,
  embedding vector(384) not null,
  created_at timestamptz default now()
);

-- Enable RLS for security
alter table public.event_embeddings enable row level security;

-- Create IVFFLAT index for cosine similarity searches
create index if not exists event_embeddings_embedding_idx
  on public.event_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Analyze table for query optimization
analyze public.event_embeddings;