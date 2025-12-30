
'use client'

import { logout } from '@/app/login/actions'

export function AdminLogoutButton() {
  return (
    <button
      onClick={async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
          await logout()
        }
      }}
      style={{
        padding: '0.4rem 0.8rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        e.currentTarget.style.color = 'var(--text-main)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      로그아웃
    </button>
  )
}
