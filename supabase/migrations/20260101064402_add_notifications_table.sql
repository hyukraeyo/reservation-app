-- 알림 테이블 생성
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table public.notifications enable row level security;

-- 정책 재생성을 위한 Drop
drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can insert their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;

-- 조회 정책
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- 삽입 정책 (Service Role은 bypass이니 클라이언트에서 insert할 때 대비)
create policy "Users can insert their own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

-- 수정 정책
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
