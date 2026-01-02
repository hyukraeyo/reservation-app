'use client'

import { Reservation } from '@/app/types'
import { updateReservationStatus } from '../actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import styles from '@/app/home.module.scss'
import ShowMoreButton from '@/app/components/ShowMoreButton'
import { ToastContainer, useToast } from '@/app/components/Toast'

export default function ReservationTable({ reservations }: { reservations: Reservation[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<'confirmed' | 'cancelled' | null>(null)
  const [displayCount, setDisplayCount] = useState(5)
  const router = useRouter()
  const { toasts, addToast } = useToast()

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    // 같은 항목이 이미 처리 중이면 무시
    if (loadingId === id) return

    setLoadingId(id)
    setLoadingAction(status)
    try {
      const result = await updateReservationStatus(id, status)
      if (result.success) {
        addToast(status === 'confirmed' ? '예약이 승인되었습니다' : '예약이 취소되었습니다', 'success')
        // 성공 시 로딩 상태 유지 - 새 데이터가 렌더링되면 해당 카드가 사라짐
        router.refresh()
      } else {
        addToast('처리 중 오류가 발생했습니다', 'error')
        setLoadingId(null)
        setLoadingAction(null)
      }
    } catch (err) {
      console.error(err)
      addToast('처리 중 오류가 발생했습니다', 'error')
      setLoadingId(null)
      setLoadingAction(null)
    }
  }

  if (!reservations || reservations.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>예약 내역이 없습니다.</div>
  }

  const visibleReservations = reservations.slice(0, displayCount)
  const hasMore = reservations.length > displayCount

  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className={styles.tableWrapper}>

        {/* Mobile Card View */}
        <div className={styles.cardList}>
          {visibleReservations.map(res => {
            const dateObj = new Date(res.time);
            const dateStr = dateObj.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
            const timeStr = dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
            const displayName = res.profiles?.full_name || res.profiles?.email || '알 수 없는 사용자';
            const isThisLoading = loadingId === res.id;

            return (
              <div key={res.id} className={`${styles.resCard} ${styles[`status-${res.status}`]}`}>
                <div className={styles.resHeader}>
                  <div className={styles.resInfo}>
                    <div className={styles.resDate}>{dateStr}</div>
                    <div className={styles.resTime}>{timeStr}</div>
                    <div className={styles.resEmail}>{displayName}</div>
                  </div>
                  <div>
                    <span className={`${styles.resBadge} ${styles[res.status]}`}>
                      {res.status === 'confirmed' ? '확정' : res.status === 'cancelled' ? '취소' : '대기'}
                    </span>
                  </div>
                </div>

                {res.status === 'pending' && (
                  <div className={styles.resActions}>
                    <button
                      onClick={() => handleStatusChange(res.id, 'cancelled')}
                      disabled={isThisLoading}
                      className={styles.btnCancel}
                    >
                      {isThisLoading && loadingAction === 'cancelled'
                        ? <div className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: 'var(--text-secondary)' }}></div>
                        : '취소'}
                    </button>
                    <button
                      onClick={() => handleStatusChange(res.id, 'confirmed')}
                      disabled={isThisLoading}
                      className={styles.btnApprove}
                    >
                      {isThisLoading && loadingAction === 'confirmed'
                        ? <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                        : '승인'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {hasMore && (
          <ShowMoreButton
            onClick={() => setDisplayCount(prev => prev + 5)}
            remainingCount={reservations.length - displayCount}
          />
        )}

      </div>
    </>
  )
}


