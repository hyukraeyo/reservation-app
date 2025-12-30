'use client'

import { updateUserRole } from '../actions'
import { useState } from 'react'

export default function UserTable({ users }: { users: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId)
    try {
      const result = await updateUserRole(userId, newRole)
      if (result?.error) {
        alert('Failed to update: ' + result.error)
      }
    } catch (e: any) {
        alert(e.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '0.5rem' }}>Email</th>
            <th style={{ padding: '0.5rem' }}>Role</th>
            <th style={{ padding: '0.5rem' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{user.email || 'No Email'}</td>
              <td style={{ padding: '0.5rem' }}>
                <select 
                  defaultValue={user.role || 'user'} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={loadingId === user.id}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '4px',
                    borderColor: '#ddd'
                  }}
                >
                  <option value="user">User</option>
                  <option value="owner">Owner (사장)</option>
                  <option value="admin">Admin</option>
                </select>
                {loadingId === user.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#666' }}>Saving...</span>}
              </td>
              <td style={{ padding: '0.5rem', color: '#888', fontSize: '0.85rem', fontFamily: 'monospace' }}>{user.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
