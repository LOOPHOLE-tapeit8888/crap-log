create table bowel_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  timestamp timestamptz default now(),
  bristol_type integer check (bristol_type between 1 and 7),
  color text,
  size text,
  duration_minutes integer,
  strain text,
  urgency text,
  symptoms text[],
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) on the table
alter table bowel_logs enable row level security;

-- Create policy to allow users to insert their own logs
create policy "Users can insert their own logs" 
  on bowel_logs for insert 
  with check (auth.uid() = user_id);

-- Create policy to allow users to view their own logs
create policy "Users can view their own logs" 
  on bowel_logs for select 
  using (auth.uid() = user_id);

-- Create policy to allow users to update their own logs
create policy "Users can update their own logs" 
  on bowel_logs for update 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- Create policy to allow users to delete their own logs
create policy "Users can delete their own logs" 
  on bowel_logs for delete 
  using (auth.uid() = user_id);
