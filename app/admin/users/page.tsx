import { getUsers } from '../actions'
import UserTable from './UserTable'
import Card from '@/app/components/Card'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <UserTable users={users} />
  )
}
