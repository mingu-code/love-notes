-- Supabase SQL Editor에서 실행하세요.
-- 문구 리스트를 저장하는 테이블. token 하나가 "관리자 링크 = 뷰어 링크" 역할을 겸함.

create table if not exists public.phrase_lists (
  token text primary key,
  phrases jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_phrase_lists_updated_at on public.phrase_lists;
create trigger trg_phrase_lists_updated_at
  before update on public.phrase_lists
  for each row execute function public.set_updated_at();

-- RLS 활성화. 이 앱은 로그인 없이 "토큰을 아는 사람만 접근 가능"이라는 모델을 쓰므로
-- 정책 자체는 열어두고, 보안은 토큰의 추측 불가능성에 의존한다 (합의된 트레이드오프).
alter table public.phrase_lists enable row level security;

drop policy if exists "public read" on public.phrase_lists;
create policy "public read" on public.phrase_lists
  for select using (true);

drop policy if exists "public insert" on public.phrase_lists;
create policy "public insert" on public.phrase_lists
  for insert with check (true);

drop policy if exists "public update" on public.phrase_lists;
create policy "public update" on public.phrase_lists
  for update using (true) with check (true);
