'use client'

import { updateUserRole } from '../actions'
import { useState, useRef } from 'react'
import { Profile } from '@/app/types'
import styles from '@/app/home.module.scss'
import ShowMoreButton from '@/app/components/ShowMoreButton'

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
        <ShowMoreButton
          onClick={() => setDisplayCount(prev => prev + 5)}
          remainingCount={users.length - displayCount}
          label="사용자 더보기"
        />
      )}


    </div>
  )
}
