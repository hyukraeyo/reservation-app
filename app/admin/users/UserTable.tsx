'use client'

import { updateUserRole } from '../actions'
import { useState, useRef } from 'react'
import { Profile } from '@/app/types'

export default function UserTable({ users }: { users: Profile[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const isProcessing = useRef(false)

  const handleRoleChange = async (userId: string, newRole: string) => {
    // 이미 처리 중이면 무시
    if (isProcessing.current || loadingId) return
    
    isProcessing.current = true
    setLoadingId(userId)
    
    try {
      const result = await updateUserRole(userId, newRole)
      if (result?.error) {
        alert('역할 변경에 실패했습니다: ' + result.error)
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message)
      } else {
        alert('알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      setLoadingId(null)
      isProcessing.current = false
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)', width: '60px' }}>프로필</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>이름</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>이메일</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>연락처</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>성별</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>연령대</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>생년월일</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>역할</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-main)' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.75rem' }}>
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.avatar_url} 
                    alt="profile" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '14px' }}>👤</span>
                  </div>
                )}
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--text-main)', fontWeight: 500 }}>
                {user.name || '-'}
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{user.email || '이메일 없음'}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{user.phone || '-'}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : user.gender || '-'}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{user.age_range || '-'}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>
                {user.birthyear ? `${user.birthyear}년 ` : ''}
                {user.birthday ? `${user.birthday.slice(0,2)}/${user.birthday.slice(2)}` : '-'}
              </td>
              <td style={{ padding: '0.75rem' }}>
                <select 
                  defaultValue={user.role || 'user'} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={!!loadingId}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="user">일반 사용자</option>
                  <option value="owner">사장님 (Owner)</option>
                  <option value="admin">관리자 (Admin)</option>
                </select>
                {loadingId === user.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>저장 중...</span>}
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{user.id.slice(0, 8)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
