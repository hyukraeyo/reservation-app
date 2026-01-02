'use client'

import styles from './login.module.scss'
import { login, signup, signInWithKakao, signInWithNaver } from './actions'
import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import LoadingSpinner from '@/app/components/LoadingSpinner'


function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [phone, setPhone] = useState('');

  // Supabase/Auth Error Mapping
  const getErrorMessage = (error: string) => {
    if (error.includes('Email not confirmed')) return '이메일 인증이 완료되지 않았습니다.\n메일함을 확인해주세요.';
    if (error.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 잘못되었습니다.';
    if (error.includes('User already registered')) return '이미 가입된 이메일입니다.';
    if (error.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다.';
    if (error.includes('Error getting user email from external provider')) return '카카오 계정에서 이메일을 가져오지 못했습니다. \n카카오 로그인 설정에서 이메일 제공에 동의해주세요.';
    return '오류가 발생했습니다: ' + error;
  };

  // Check for error or code in URL
  const searchParams = useSearchParams();
  const error = searchParams.get('error_description') || searchParams.get('error');
  const code = searchParams.get('code');

  useEffect(() => {
    // If auth code comes to login page (wrong redirect), forward it to callback
    if (code) {
      window.location.href = `/auth/callback?code=${code}`;
      return;
    }

    if (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) });
    }
  }, [error, code]);

  // 전화번호 포맷팅 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
    let formatted = '';

    if (value.length <= 3) {
      formatted = value;
    } else if (value.length <= 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    setPhone(formatted);
  };

  // Using simple form submission for now to demonstrate UI
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    if (mode === 'signup') {
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        const res = await login(formData);
        if (res?.error) setMessage({ type: 'error', text: getErrorMessage(res.error) });
      } else {
        const res = await signup(formData);
        if (res?.error) {
          setMessage({ type: 'error', text: getErrorMessage(res.error) });
        } else if (res?.success) {
          setMessage({ type: 'success', text: res.message });
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message.includes('NEXT_REDIRECT')) {
          // Redirecting, ignoring error
          return;
        }
        setMessage({ type: 'error', text: '알 수 없는 오류가 발생했습니다. ' + e.message });
      } else {
        setMessage({ type: 'error', text: '알 수 없는 오류가 발생했습니다.' });
      }
    } finally {
      // Don't clear loading if it's a redirect, because the page will unload
      // But we can't easily distinguish here without checking the error again.
      // However, if we redirect, the state update on unmounted component should be fine or ignored.
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithKakao();
      if (res?.url) {
        window.location.href = res.url;
      } else if (res?.error) {
        alert('카카오 로그인 오류: ' + res.error);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      alert('카카오 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithNaver();
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (error: unknown) {
      console.error('Naver login error:', error);
      alert('네이버 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.themeWrapper}>
        <ThemeToggle />
      </div>
      <div className={styles.loginCard}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <LoadingSpinner size="medium" />
          </div>
        )}
        <div className={styles.header}>
          <h1>{mode === 'login' ? '환영합니다' : '회원가입'}</h1>
          <p>{mode === 'login' ? '예약 관리를 위해 로그인해주세요' : '무료로 예약을 시작해보세요'}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {message && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: message.type === 'error' ? '#dc2626' : '#16a34a',
              borderRadius: '4px',
              fontSize: '0.9rem',
              whiteSpace: 'pre-line'
            }}>
              {message.text}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="hello@example.com"
              required
            />
          </div>

          {mode === 'signup' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="full_name">이름</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="홍길동"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">전화번호</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  pattern="[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}"
                  title="010-0000-0000 형식으로 입력해주세요."
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? '잠시만 기다려주세요...' : (mode === 'login' ? '로그인' : '가입하기')}
            </button>

            <div className={styles.divider}>
              <span>또는 간편 로그인</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                type="button"
                className={styles.kakaoButton}
                onClick={handleKakaoLogin}
                disabled={loading}
              >
                카카오로 시작하기
              </button>

              <button
                type="button"
                className={styles.naverButton}
                onClick={handleNaverLogin}
                disabled={loading}
              >
                네이버로 시작하기
              </button>
            </div>

            <div className={styles.divider}>
              <span>계정이 없으신가요?</span>
            </div>

            <button
              type="button"
              className={styles.signupButton}
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setMessage(null)
                setPhone('')
              }}
            >
              {mode === 'login' ? '이메일로 회원가입' : '기존 계정으로 로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  )
}
