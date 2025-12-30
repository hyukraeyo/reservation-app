import { getUsers } from '../actions'
import UserTable from './UserTable'

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div>


      <UserTable users={users} />
    </div>
  )
}
