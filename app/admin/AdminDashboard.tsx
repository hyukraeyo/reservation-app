'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import styles from './admin.module.scss'
import { Reservation } from '@/app/types'
import Card from '@/app/components/Card'

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  const fetchReservations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setReservations(data as unknown as Reservation[]);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) setUserRole(profile.role);
      }
    };
    fetchUserRole();
    fetchReservations();

    const channel = supabase
      .channel('realtime-admin-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReservations(prev => [payload.new as Reservation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setReservations(prev => prev.map(res => res.id === payload.new.id ? { ...res, ...payload.new } : res));
          } else if (payload.eventType === 'DELETE') {
            setReservations(prev => prev.filter(res => res.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchReservations]);

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
  };

  const LiveBadge = () => (
    <span className={styles.liveIndicator}>Live</span>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>관리자 대시보드</h2>
        <p className={styles.subtitle}>실시간 예약 현황 및 시스템 통계를 확인하세요.</p>
      </header>

      {/* 통계 섹션 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>총 예약</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard} style={{ borderColor: '#f59e0b' }}>
          <span className={styles.statLabel}>대기 중</span>
          <span className={styles.statValue} style={{ color: '#f59e0b' }}>{stats.pending}</span>
        </div>
        <div className={styles.statCard} style={{ borderColor: '#10b981' }}>
          <span className={styles.statLabel}>확정됨</span>
          <span className={styles.statValue} style={{ color: '#10b981' }}>{stats.confirmed}</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* 메뉴 링크 섹션 */}
        <Card title="빠른 메뉴">
          <div className={styles.menuGrid}>
            <Link href="/admin/reservations" className={styles.menuCard}>
              <div className={styles.menuIcon}>📅</div>
              <div>
                <h4>예약 상세 관리</h4>
                <p>승인, 취소 및 시간 확인</p>
              </div>
            </Link>
            {userRole === 'admin' && (
              <Link href="/admin/users" className={styles.menuCard}>
                <div className={styles.menuIcon}>👥</div>
                <div>
                  <h4>사용자 관리</h4>
                  <p>회원 역할 및 권한 변경</p>
                </div>
              </Link>
            )}
            <Link href="/" className={styles.menuCard}>
              <div className={styles.menuIcon}>🏠</div>
              <div>
                <h4>예약 홈</h4>
                <p>메인 화면으로 이동</p>
              </div>
            </Link>
          </div>
        </Card>

        {/* 실시간 현황 섹션 */}
        <Card title="최근 예약 현황" badge={<LiveBadge />}>
          <div className={styles.liveList}>
            {loading ? (
              <p className={styles.empty}>로딩 중...</p>
            ) : reservations.length > 0 ? (
              reservations.slice(0, 5).map(res => (
                <div key={res.id} className={styles.liveItem}>
                  <div className={styles.liveInfo}>
                    <p className={styles.liveTime}>{new Date(res.time).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className={styles.liveId}>ID: {res.id.slice(0, 8)}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[res.status]}`}>
                    {res.status === 'confirmed' ? '확정' : res.status === 'cancelled' ? '취소' : '대기'}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.empty}>새로운 예약이 없습니다.</p>
            )}
            {reservations.length > 5 && (
              <Link href="/admin/reservations" className={styles.viewMore}>
                전체 내역 보기 →
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

