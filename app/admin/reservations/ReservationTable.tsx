'use client'

import { Reservation } from '@/app/types'
import { updateReservationStatus } from '../actions'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

import styles from '@/app/home.module.scss'

export default function ReservationTable({ reservations }: { reservations: Reservation[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(5)
  const isProcessing = useRef(false)
  const router = useRouter()

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (isProcessing.current || loadingId) return
    isProcessing.current = true
    setLoadingId(id)
    try {
      const result = await updateReservationStatus(id, status)
      if (result.success) {
        router.refresh()
      } else {
        alert('상태 변경 중 오류가 발생했습니다: ' + result.error)
      }
    } catch (err) {
      console.error(err)
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setLoadingId(null)
      isProcessing.current = false
    }
  }

  if (!reservations || reservations.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>예약 내역이 없습니다.</div>
  }

  const visibleReservations = reservations.slice(0, displayCount)
  const hasMore = reservations.length > displayCount

  return (
    <div className={styles.tableWrapper}>
      {/* Desktop Table View */}
      <div className="desktop-only" style={{ overflowX: 'auto', display: 'none' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>시간</th>
              <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>고객 이메일</th>
              <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>상태</th>
              <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>예약 ID</th>
              <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {visibleReservations.map(res => {
              const date = new Date(res.time);
              const formattedDate = date.toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });
              const email = res.profiles?.email || '알 수 없는 사용자';

              return (
                <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{formattedDate}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      backgroundColor: res.status === 'confirmed' ? 'rgba(76, 175, 80, 0.1)' : res.status === 'cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                      color: res.status === 'confirmed' ? '#4caf50' : res.status === 'cancelled' ? '#f44336' : '#ff9800',
                      fontWeight: 600
                    }}>
                      {res.status === 'confirmed' ? '확정됨' : res.status === 'cancelled' ? '취소됨' : '대기중'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {res.id.slice(0, 8)}...
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {res.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleStatusChange(res.id, 'confirmed')}
                          disabled={!!loadingId}
                          className={styles.statusButton}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            cursor: loadingId ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {loadingId === res.id ? (
                            <div className="spinner" style={{ width: '0.8rem', height: '0.8rem' }}></div>
                          ) : '승인'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(res.id, 'cancelled')}
                          disabled={!!loadingId}
                          className={styles.statusButton}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#f44336',
                            color: 'white',
                            cursor: loadingId ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {loadingId === res.id ? (
                            <div className="spinner" style={{ width: '0.8rem', height: '0.8rem' }}></div>
                          ) : '취소'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.cardList}>
        {visibleReservations.map(res => {
          const date = new Date(res.time);
          const formattedDate = date.toLocaleDateString('ko-KR', {
            month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
          const email = res.profiles?.email || '알 수 없는 사용자';

          return (
            <div key={res.id} className={styles.nestItem}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTime}>{formattedDate}</div>
                  <div className={styles.cardEmail}>{email}</div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  backgroundColor: res.status === 'confirmed' ? 'rgba(76, 175, 80, 0.1)' : res.status === 'cancelled' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                  color: res.status === 'confirmed' ? '#4caf50' : res.status === 'cancelled' ? '#f44336' : '#ff9800',
                  fontWeight: 700
                }}>
                  {res.status === 'confirmed' ? '확정' : res.status === 'cancelled' ? '취소' : '대기'}
                </span>
              </div>

              {res.status === 'pending' && (
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleStatusChange(res.id, 'confirmed')}
                    disabled={!!loadingId}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loadingId === res.id ? <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div> : '승인'}
                  </button>
                  <button
                    onClick={() => handleStatusChange(res.id, 'cancelled')}
                    disabled={!!loadingId}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#f44336',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loadingId === res.id ? <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div> : '취소'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className={styles.showMoreButton}
            onClick={() => setDisplayCount(prev => prev + 5)}
          >
            더 보기 ({reservations.length - displayCount}개 남음)
          </button>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-only { display: block !important; }
          .${styles.cardList} { display: none !important; }
        }
      `}</style>
    </div>
  )
}
