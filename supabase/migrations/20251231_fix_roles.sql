-- 1. profiles 테이블의 role 컬럼 기본값을 'user'로 설정하여
--    앞으로 가입하는 모든 회원이 자동으로 user 권한을 갖도록 함
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- 2. test_1@gmail.com 계정의 권한을 강제로 'user'로 변경 (권한 박탈)
UPDATE public.profiles
SET role = 'user'
WHERE email = 'test_1@gmail.com';

-- 3. (선택사항) role이 NULL인 기존 데이터가 있다면 모두 'user'로 초기화
UPDATE public.profiles
SET role = 'user'
WHERE role IS NULL;
