'use client'

import { updateUserRole, updateUserMemo } from '../actions'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/app/types'
import styles from './users.module.scss'
import ShowMoreButton from '@/app/components/ShowMoreButton'
import { useConfirmModal } from '@/app/components/ConfirmModal'
import Card from '@/app/components/Card'
import { useToast, ToastContainer } from '@/app/components/Toast'

import Select, { Option } from '@/app/components/Select';

const ROLE_OPTIONS: Option[] = [
  { value: 'user', label: '손님' },
  { value: 'owner', label: '사장님' },
  { value: 'admin', label: '관리자' }
];

function UserMemo({ userId, initialMemo, addToast }: {
  userId: string,
  initialMemo: string | null,
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [memo, setMemo] = useState(initialMemo || '')
  const [tempMemo, setTempMemo] = useState(initialMemo || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setTempMemo(memo)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempMemo(memo)
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const result = await updateUserMemo(userId, tempMemo)
      if (result?.success) {
        setMemo(tempMemo)
        setIsEditing(false)
        addToast('메모가 저장되었습니다.', 'success')
      } else {
        addToast('저장 실패: ' + (result?.error || '알 수 없는 오류'), 'error')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      addToast('오류 발생: ' + message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.memoSection}>
      <div className={styles.memoHeader}>
        <label>관리자 메모</label>
        {!isEditing && (
          <button onClick={handleEdit}>
            {memo ? '수정' : '추가 +'}
          </button>
        )}
      </div>

      {isEditing ? (
        <>
          <textarea
            value={tempMemo}
            onChange={e => setTempMemo(e.target.value)}
            placeholder="손님에 대한 메모를 입력하세요 (예: 알러지, 단골 여부 등)"
            autoFocus
          />
          <div className={styles.memoActions}>
            <button className={styles.btnCancel} onClick={handleCancel} disabled={isSaving}>취소</button>
            <button className={styles.btnSave} onClick={handleSave} disabled={isSaving}>
              {isSaving ? '저장...' : '저장'}
            </button>
          </div>
        </>
      ) : (
        <div className={`${styles.memoContent} ${!memo ? styles.empty : ''}`} onClick={handleEdit} style={{ cursor: 'pointer' }}>
          {memo || '등록된 메모가 없습니다. 내용을 추가하려면 클릭하세요.'}
        </div>
      )}
    </div>
  )
}



function DeleteUserButton({ userId, userName, onDelete }: { userId: string, userName: string | null, onDelete: (id: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, ModalComponent } = useConfirmModal();

  const handleClick = async () => {
    const isConfirmed = await confirm({
      title: '사용자 삭제',
      message: `${userName || '이 사용자'}를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      variant: 'danger'
    });

    if (isConfirmed) {
      onDelete(userId);
    }
  };

  return (
    <>
      {ModalComponent}
      <button
        className={styles.deleteButton}
        onClick={handleClick}
        title="사용자 삭제"
        disabled={isDeleting}
      >
        🗑️
      </button>
    </>
  )
}

export default function UserTable({ users }: { users: Profile[] }) {
  const { toasts, addToast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
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

    if (!isConfirmed) return

    isProcessing.current = true
    setLoadingId(userId)

    try {
      const result = await updateUserRole(userId, newRole)
      if (result?.error) {
        addToast('역할 변경에 실패했습니다: ' + result.error, 'error')
      } else {
        router.refresh()
        addToast('권한이 변경되었습니다.', 'success')
      }
    } catch (e: unknown) {
      console.error(e)
      addToast('상태 변경 중 오류가 발생했습니다.', 'error')
    } finally {
      setLoadingId(null)
      isProcessing.current = false
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (isProcessing.current) return
    isProcessing.current = true

    try {
      const { deleteUser } = await import('../actions');
      const result = await deleteUser(userId);

      if (result?.error) {
        addToast('삭제 실패: ' + result.error, 'error')
      } else {
        router.refresh()
        addToast('사용자가 삭제되었습니다.', 'success')
      }
    } catch (e: unknown) {
      console.error(e)
      addToast('삭제 중 오류가 발생했습니다.', 'error')
    } finally {
      isProcessing.current = false
    }
  }

  if (!users || users.length === 0) {
    return <div className={styles.emptyState}>사용자가 없습니다.</div>
  }

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase()
    return (
      (user.name?.toLowerCase() || '').includes(term) ||
      (user.email?.toLowerCase() || '').includes(term) ||
      (user.phone || '').includes(term)
    )
  })

  const visibleUsers = filteredUsers.slice(0, displayCount)
  const hasMore = filteredUsers.length > displayCount

  return (
    <div className={styles.container}>
      <ToastContainer toasts={toasts} />
      {ModalComponent}

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="🔍 이름, 이메일, 전화번호 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {visibleUsers.map(user => (
        <Card key={user.id}>
          {/* Header */}
          <div className={styles.userHeader}>
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="profile" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>👤</div>
            )}
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                <span className={styles.userNameText}>{user.name || '이름 없음'}</span>

                {/* Role Selector */}
                <div className={styles.roleBadgeContainer}>
                  <Select
                    value={user.role || 'user'}
                    options={ROLE_OPTIONS}
                    onChange={(newRole) => handleRoleChange(user.id, newRole)}
                    triggerRender={(selectedOption, isOpen, toggle) => {
                      const isLoading = loadingId === user.id;
                      return (
                        <button
                          className={`${styles.roleBadge} ${styles[`role_${selectedOption?.value}`]}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoading) toggle();
                          }}
                          disabled={isLoading}
                          title="권한 변경"
                        >
                          {isLoading ? (
                            <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle className={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            selectedOption?.label
                          )}
                        </button>
                      );
                    }}
                  />
                </div>
                <DeleteUserButton userId={user.id} userName={user.name || null} onDelete={handleDeleteUser} />
              </div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>

          {/* Details */}
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
              <label>가입일</label>
              <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
            </div>
          </div>

          {/* Memo */}
          <UserMemo userId={user.id} initialMemo={user.memo || null} addToast={addToast} />
        </Card>
      ))}

      {hasMore && (
        <ShowMoreButton
          onClick={() => setDisplayCount(prev => prev + 5)}
          remainingCount={filteredUsers.length - displayCount}
          label="사용자 더보기"
        />
      )}
    </div>
  )
}
