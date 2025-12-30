
'use client'

import styles from './login.module.scss'
import { login, signup, signInWithKakao } from './actions'
import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

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
    } catch (e: any) {
      setMessage({ type: 'error', text: '알 수 없는 오류가 발생했습니다. ' + e.message });
    } finally {
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
    } catch (error: any) {
        console.error('Login error:', error);
        alert('카카오 로그인 중 오류가 발생했습니다.');
        setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>{mode === 'login' ? '환영합니다' : '회원가입'}</h1>
          <p>{mode === 'login' ? '예약 관리를 위해 로그인해주세요' : '무료로 예약을 시작해보세요'}</p>
        </div>

        <button 
            type="button" 
            className={styles.kakaoButton}
            onClick={handleKakaoLogin}
            disabled={loading}
        >
            카카오로 시작하기
        </button>

        <div className={styles.divider}>
            <span>또는 이메일로 시작하기</span>
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
            >
              {loading ? '처리 중...' : (mode === 'login' ? '로그인' : '가입하기')}
            </button>
            
            <div className={styles.divider}>
              <span>또는</span>
            </div>

            <button 
              type="button" 
              className={styles.signupButton}
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setMessage(null)
              }}
            >
              {mode === 'login' ? '계정 만들기' : '이미 계정이 있어요'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
