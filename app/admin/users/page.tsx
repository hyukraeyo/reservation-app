import { getUsers } from '../actions'
import UserTable from './UserTable'
import Card from '@/app/components/Card'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <Card title="회원 권한 관리">
      <UserTable users={users} />
    </Card>
  )
}
