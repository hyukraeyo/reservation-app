import { getUsers } from '../actions'
import UserTable from './UserTable'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>User Management</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Manage user roles and permissions. Assign 'Owner' role to business owners.
      </p>
      
      {/* Instructions for the developer/admin if setup is incomplete */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #eee' }}>
        <strong>Note:</strong> Ensure your <code>profiles</code> table has <code>email</code> and <code>role</code> columns.
        <br/>
        Roles: <code>user</code>, <code>owner</code>, <code>admin</code>.
      </div>

      <UserTable users={users} />
    </div>
  )
}
