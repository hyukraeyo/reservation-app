'use client'

import { updateUserRole } from '../actions'
import { useState, useRef } from 'react'
import { Profile } from '@/app/types'
import styles from '@/app/home.module.scss'

export default function UserTable({ users }: { users: Profile[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(5)
  const isProcessing = useRef(false)

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (isProcessing.current || loadingId) return

    isProcessing.current = true
    setLoadingId(userId)

    try {
      const result = await updateUserRole(userId, newRole)
      if (result?.error) {
        alert('역할 변경에 실패했습니다: ' + result.error)
      }
    } catch (e: unknown) {
      console.error(e)
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setLoadingId(null)
      isProcessing.current = false
    }
  }

  if (!users || users.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>사용자가 없습니다.</div>
  }

  const visibleUsers = users.slice(0, displayCount)
  const hasMore = users.length > displayCount

  return (
    <div className={styles.tableWrapper}>
      {/* Desktop Table View */}
      <div className="desktop-only" style={{ overflowX: 'auto', display: 'none' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>프로필</th>
              <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>이름</th>
              <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>이메일</th>
              <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>연락처</th>
              <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>역할</th>
              <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '0.75rem' }}>
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt="profile"
                      className={styles.userAvatar}
                      style={{ width: '36px', height: '36px' }}
                    />
                  ) : (
                    <div className={styles.userAvatarPlaceholder} style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                      👤
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {user.name || '-'}
                </td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{user.email}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{user.phone || '-'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <select
                    defaultValue={user.role || 'user'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={!!loadingId}
                    className={styles.roleSelect}
                    style={{ padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <option value="user">일반 사용자</option>
                    <option value="owner">사장님 (Owner)</option>
                    <option value="admin">관리자 (Admin)</option>
                  </select>
                </td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  {user.id.slice(0, 8)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.cardList}>
        {visibleUsers.map(user => (
          <div key={user.id} className={styles.nestItem}>
            <div className={styles.userCardMain}>
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="profile" className={styles.userAvatar} />
              ) : (
                <div className={styles.userAvatarPlaceholder}>👤</div>
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{user.name || '이름 없음'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
            </div>

            <div className={styles.userInfoDetails}>
              <div className={styles.infoItem}>
                <label>연락처</label>
                <span>{user.phone || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <label>성별/연령</label>
                <span>{user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '-'}{user.age_range ? ` / ${user.age_range}` : ''}</span>
              </div>
              <div className={styles.infoItem}>
                <label>생일</label>
                <span>
                  {user.birthyear ? `${user.birthyear}년 ` : ''}
                  {user.birthday ? `${user.birthday.slice(0, 2)}/${user.birthday.slice(2)}` : '-'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <label>ID</label>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.id.slice(0, 8)}...</span>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>권한 설정</label>
              <select
                defaultValue={user.role || 'user'}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                disabled={!!loadingId}
                className={styles.roleSelect}
              >
                <option value="user">일반 사용자</option>
                <option value="owner">사장님 (Owner)</option>
                <option value="admin">관리자 (Admin)</option>
              </select>
            </div>
            {loadingId === user.id && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                설정 저장 중...
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            className={styles.showMoreButton}
            onClick={() => setDisplayCount(prev => prev + 5)}
          >
            사용자 더 보기 ({users.length - displayCount}명 남음)
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
