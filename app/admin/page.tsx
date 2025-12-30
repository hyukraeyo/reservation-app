import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome, Admin</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Link href="/admin/users" style={{
          padding: '2rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          display: 'block',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s',
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>User Management</h3>
          <p style={{ margin: 0, color: '#666' }}>Manage users and assign Owner roles.</p>
        </Link>
        
        {/* Future modules can be added here */}
      </div>
    </div>
  )
}
