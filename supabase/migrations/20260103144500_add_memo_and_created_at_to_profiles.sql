-- profiles 테이블에 관리자 메모용 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS memo TEXT;

-- profiles 테이블에 가입일 컬럼 추가 (기존 데이터는 현재 시간으로 설정됨)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
