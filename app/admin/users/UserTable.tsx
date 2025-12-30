'use client'

import { updateUserRole } from '../actions'
import { useState } from 'react'
import { Profile } from '@/app/types'

export default function UserTable({ users }: { users: Profile[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
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
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '0.5rem', color: 'var(--text-main)' }}>이메일</th>
            <th style={{ padding: '0.5rem', color: 'var(--text-main)' }}>역할</th>
            <th style={{ padding: '0.5rem', color: 'var(--text-main)' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.5rem', color: 'var(--text-main)' }}>{user.email || '이메일 없음'}</td>
              <td style={{ padding: '0.5rem' }}>
                <select 
                  defaultValue={user.role || 'user'} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={loadingId === user.id}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '4px',
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="user">일반 사용자</option>
                  <option value="owner">사장님 (Owner)</option>
                  <option value="admin">관리자 (Admin)</option>
                </select>
                {loadingId === user.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>저장 중...</span>}
              </td>
              <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{user.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
