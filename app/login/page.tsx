'use client'

import styles from './login.module.scss'
import { signInWithKakao, signInWithNaver } from './actions'
import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import InstallPrompt from '@/app/components/InstallPrompt'


function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Supabase/Auth Error Mapping
  const getErrorMessage = (error: string) => {
    if (error.includes('Email not confirmed')) return '이메일 인증이 완료되지 않았습니다.\n메일함을 확인해주세요.';
    if (error.includes('Error getting user email from external provider')) return '카카오 계정에서 이메일을 가져오지 못했습니다. \n카카오 로그인 설정에서 이메일 제공에 동의해주세요.';
    return '오류가 발생했습니다: ' + error;
  };

  // Check for error or code in URL
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error_description') || searchParams.get('error');
  const code = searchParams.get('code');

  const urlErrorMessage = errorParam ? getErrorMessage(errorParam) : null;
  const displayMessage = loginError || urlErrorMessage;

  useEffect(() => {
    // If auth code comes to login page (wrong redirect), forward it to callback
    if (code) {
      window.location.href = `/auth/callback?code=${code}`;
    }
  }, [code]);

  const handleKakaoLogin = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await signInWithKakao();
      if (res?.url) {
        window.location.href = res.url;
      } else if (res?.error) {
        setLoginError('카카오 로그인 오류: ' + res.error);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setLoginError('카카오 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await signInWithNaver();
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (error: unknown) {
      console.error('Naver login error:', error);
      setLoginError('네이버 로그인 중 오류가 발생했습니다.');
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
          <h1>환영합니다</h1>
          <p>예약 관리를 위해 로그인해주세요</p>
        </div>

        <div className={styles.form}>
          {displayMessage && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '4px',
              fontSize: '0.9rem',
              whiteSpace: 'pre-line'
            }}>
              {displayMessage}
            </div>
          )}

          <div className={styles.actions}>
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
            <InstallPrompt />
          </div>
        </div>
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
