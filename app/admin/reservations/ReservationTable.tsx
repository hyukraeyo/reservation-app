'use client'

import { Reservation } from '@/app/types'
import { updateReservationStatus } from '../actions'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ReservationTable({ reservations }: { reservations: Reservation[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const isProcessing = useRef(false) // 중복 요청 방지용
  const router = useRouter()

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    // 이미 처리 중이면 무시
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

  return (
    <div style={{ overflowX: 'auto' }}>
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
          {reservations.map(res => {
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
                        style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          cursor: loadingId ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          opacity: loadingId ? 0.7 : 1
                        }}
                      >
                        {loadingId === res.id ? '처리중...' : '승인'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(res.id, 'cancelled')}
                        disabled={!!loadingId}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#f44336',
                          color: 'white',
                          cursor: loadingId ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          opacity: loadingId ? 0.7 : 1
                        }}
                      >
                        {loadingId === res.id ? '처리중...' : '취소'}
                      </button>
                    </div>
                  )}
                  {res.status !== 'pending' && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>관리 불가</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
