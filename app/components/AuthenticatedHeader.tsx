import { createClient } from '@/utils/supabase/server'
import Header from './Header'

// 헤더 데이터 로딩 컴포넌트
export default async function AuthenticatedHeader() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 로그인하지 않은 경우 헤더 표시 안 함
    if (!user) {
        return null
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'
    const isSuperAdmin = profile?.role === 'admin'

    return (
        <Header
            userName={profile?.full_name}
            userEmail={user.email}
            isAdmin={isAdmin}
            isSuperAdmin={isSuperAdmin}
        />
    )
}
