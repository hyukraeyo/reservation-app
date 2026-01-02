-- profiles 테이블에 관리자 메모용 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS memo TEXT;

-- profiles 테이블에 가입일 컬럼 추가 (기존 데이터는 현재 시간으로 설정됨)
-- 만약 auth.users의 created_at을 가져오고 싶다면 별도의 UPDATE 쿼리가 필요하지만, 
-- 간단하게 현재 시점부터 기록하도록 설정합니다.
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
