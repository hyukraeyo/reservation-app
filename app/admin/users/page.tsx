import { getUsers } from '../actions'
import UserTable from './UserTable'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>사용자 관리</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        사용자의 역할과 권한을 관리합니다. 업계 종사자에게 &apos;사장님(Owner)&apos; 역할을 부여할 수 있습니다.
      </p>
      
      {/* Instructions for the developer/admin if setup is incomplete */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
        <strong>참고:</strong> <code>profiles</code> 테이블에 <code>email</code> 및 <code>role</code> 컬럼이 올바르게 설정되어 있는지 확인하세요.
        <br/>
        사용 가능한 역할: <code>user</code> (일반), <code>owner</code> (사장), <code>admin</code> (관리자).
      </div>

      <UserTable users={users} />
    </div>
  )
}
