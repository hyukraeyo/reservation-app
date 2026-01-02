'use client'

import { Reservation } from '@/app/types'
import { updateReservationStatus } from '../actions'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import styles from '@/app/home.module.scss'
import ShowMoreButton from '@/app/components/ShowMoreButton'
import { ToastContainer, useToast } from '@/app/components/Toast'
import StatusBadge from '@/app/components/StatusBadge'
import { formatReservationDate, FILTER_OPTIONS, SORT_OPTIONS, FilterType, SortType } from '@/utils/reservation'
import { useConfirmModal } from '@/app/components/ConfirmModal'
import Card from '@/app/components/Card'

export default function ReservationTable({ reservations }: { reservations: Reservation[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<'confirmed' | 'cancelled' | null>(null)
  const [displayCount, setDisplayCount] = useState(5)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('created-desc')
  const router = useRouter()
  const { toasts, addToast } = useToast()
  const { confirm, ModalComponent } = useConfirmModal()

  // Filter and sort reservations
  const filteredReservations = useMemo(() => {
    let result = [...reservations];

    if (filter !== 'all') {
      result = result.filter(r => r.status === filter);
    }

    result.sort((a, b) => {
      if (sort === 'time-asc') {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      } else if (sort === 'time-desc') {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      } else {
        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bCreated - aCreated;
      }
    });

    return result;
  }, [reservations, filter, sort]);

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (loadingId === id) return

    const actionName = status === 'confirmed' ? '승인' : '취소';
    const variant = status === 'confirmed' ? 'default' : 'danger';

    const isConfirmed = await confirm({
      title: `예약 ${actionName}`,
      message: `정말 이 예약을 ${actionName}하시겠습니까?`,
      variant: variant
    });

    if (!isConfirmed) return;

    setLoadingId(id)
    setLoadingAction(status)
    try {
      const result = await updateReservationStatus(id, status)
      if (result.success) {
        addToast(status === 'confirmed' ? '예약이 승인되었습니다' : '예약이 취소되었습니다', 'success')
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

  const visibleReservations = filteredReservations.slice(0, displayCount)
  const hasMore = filteredReservations.length > displayCount

  return (
    <>
      <ToastContainer toasts={toasts} />
      {ModalComponent}

      {/* Filter & Sort Controls */}
      {reservations.length > 0 && (
        <div className={styles.filterSection}>
          <div className={styles.filterChips}>
            {FILTER_OPTIONS.map(option => (
              <button
                key={option.value}
                className={`${styles.filterChip} ${filter === option.value ? styles.active : ''}`}
                onClick={() => { setFilter(option.value); setDisplayCount(5); }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {filteredReservations.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
            {filter !== 'all' ? '해당 조건의 예약이 없습니다.' : '예약 내역이 없습니다.'}
          </div>
        ) : (
          <div className={styles.cardList}>
            {visibleReservations.map(res => {
              const { fullDate, time } = formatReservationDate(res.time);
              const displayName = res.profiles?.full_name || res.profiles?.email || '알 수 없는 사용자';
              const isThisLoading = loadingId === res.id;

              return (
                <Card
                  key={res.id}
                  className={styles[`status-${res.status}`]}
                >
                  <div className={styles.resHeader}>
                    <div className={styles.resInfo}>
                      <div className={styles.resDate}>{fullDate}</div>
                      <div className={styles.resTime}>{time}</div>
                      <div className={styles.resEmail}>{displayName}</div>
                    </div>
                    <StatusBadge status={res.status} />
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
                </Card>
              )
            })}
          </div>
        )}

        {hasMore && (
          <ShowMoreButton
            onClick={() => setDisplayCount(prev => prev + 5)}
            remainingCount={filteredReservations.length - displayCount}
          />
        )}
      </div>
    </>
  )
}
