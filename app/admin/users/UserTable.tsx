'use client'

import { updateUserRole } from '../actions'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/app/types'
import styles from './users.module.scss'
import ShowMoreButton from '@/app/components/ShowMoreButton'
import { useConfirmModal } from '@/app/components/ConfirmModal'

export default function UserTable({ users }: { users: Profile[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(5)
  const isProcessing = useRef(false)
  const router = useRouter()
  const { confirm, ModalComponent } = useConfirmModal()

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (isProcessing.current || loadingId) return

    const isConfirmed = await confirm({
      title: '권한 변경',
      message: '정말 이 사용자의 권한을 변경하시겠습니까?',
      variant: 'danger'
    })

    if (!isConfirmed) {
      // 취소 시 원래 값으로 되돌리기 위해 새로고침 (간단한 방법)
      router.refresh()
      return
    }

    isProcessing.current = true
    setLoadingId(userId)

    try {
      const result = await updateUserRole(userId, newRole)
      if (result?.error) {
        alert('역할 변경에 실패했습니다: ' + result.error)
      } else {
        // 성공 시 데이터 리프레시
        router.refresh()
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
    return <div className={styles.emptyState}>사용자가 없습니다.</div>
  }

  const visibleUsers = users.slice(0, displayCount)
  const hasMore = users.length > displayCount

  return (
    <div className={styles.container}>
      {ModalComponent}
      {visibleUsers.map(user => (
        <div key={user.id} className={styles.userCard}>
          {/* Header: Avatar + Name/Email */}
          <div className={styles.userHeader}>
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="profile" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>👤</div>
            )}
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name || '이름 없음'}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <label>연락처</label>
              <span>{user.phone || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <label>성별/연령</label>
              <span>
                {user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '-'}
                {user.age_range ? ` / ${user.age_range}` : ''}
              </span>
            </div>
            <div className={styles.detailItem}>
              <label>생일</label>
              <span>
                {user.birthyear ? `${user.birthyear}년 ` : ''}
                {user.birthday ? `${user.birthday.slice(0, 2)}/${user.birthday.slice(2)}` : '-'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <label>ID</label>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.id.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Role Section */}
          <div className={styles.roleSection}>
            <select
              value={user.role || 'user'}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
              disabled={!!loadingId}
              className={styles.roleSelect}
            >
              <option value="user">일반 사용자</option>
              <option value="owner">사장님</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          {loadingId === user.id && (
            <div className={styles.loadingText}>설정 저장 중...</div>
          )}
        </div>
      ))}

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


