-- Assistant IA: threads et messages (optionnel, pour persistance future)
create table if not exists assistant_threads (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assistant_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references assistant_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_assistant_messages_thread_id on assistant_messages(thread_id);
create index if not exists idx_assistant_threads_updated_at on assistant_threads(updated_at desc);
