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

-- 기존 정책이 있을 수 있으니 drop 후 생성 (선택)
drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Server can insert notifications" on public.notifications;

-- 조회 정책: 본인 것만 조회 가능
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- 삽입 정책: 모든 인증된 사용자가(자신에게) 또는 서버 로직(service role)이 삽입
-- 보통 서버 액션에서는 service role key를 쓰거나, 사용자가 트리거할 때는 auth.uid()를 씁니다.
-- 여기서는 insert 로직을 서버 액션(service role)에서 처리할 것이므로,
-- 만약 클라이언트에서 직접 insert할 일이 없다면 insert 정책은 엄격하게 해도 됩니다.
-- 하지만 여기서는 Supabase Client를 통해 insert할 수도 있으니:
create policy "Users can insert their own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id); 
  
-- 더 유연하게: service_role은 bypass RLS이므로 OK.

-- 수정 정책 (읽음 처리 등)
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
