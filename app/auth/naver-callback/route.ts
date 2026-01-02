
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code) {
        // 1. 쿠키 제어용 Supabase Client (유저 로그인 세션 생성용)
        const supabase = await createClient()

        // 2. 관리자 권한 Supabase Client (이메일 인증 우회 및 강제 가입용)
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 3. 네이버 토큰 발급
        const clientId = process.env.NAVER_CLIENT_ID!
        const clientSecret = process.env.NAVER_CLIENT_SECRET!
        const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=${state}`

        try {
            const tokenRes = await fetch(tokenUrl)
            const tokenData = await tokenRes.json()

            if (tokenData.error) {
                console.error('Naver Token Error:', tokenData.error, tokenData.error_description)
                return NextResponse.redirect(`${origin}/login?error=naver_token_error`)
            }

            const accessToken = tokenData.access_token

            // 4. 네이버 사용자 정보 조회
            const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            const profileData = await profileRes.json()

            if (profileData.resultcode !== '00') {
                console.error('Naver Profile Error:', profileData.message)
                return NextResponse.redirect(`${origin}/login?error=naver_profile_error`)
            }

            const naverUser = profileData.response
            const email = naverUser.email
            // 네이버 고유 ID와 시크릿을 조합해 가짜 비밀번호 생성 (로그인용)
            const fakePassword = `naver_${naverUser.id}_secret_key_!@#`

            // 5. 유저 존재 여부 확인 (Admin API 사용)
            const { data: { users: _users }, error: _listError } = await supabaseAdmin.auth.admin.listUsers()
            // *주의: listUsers는 기본 50명 등 제한이 있을 수 있으므로 실제 프로덕션에서는 getUserByEmail 등을 권장하지만
            // Supabase JS v2 admin에는 getUserByEmail이 없고 listUsers로 찾아야 함.
            // 더 정확하게는: signInWithPassword를 먼저 시도하고 실패하면 가입시키는 플로우가 효율적.

            // 전략: 그냥 로그인 시도 -> 실패시 "Admin"으로 가입 (무조건 이메일 인증 완료 처리) -> 다시 로그인

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: fakePassword
            })

            if (signInError) {
                console.log('Naver: Existing user login failed, trying to create new user...', signInError.message)

                // 가입 시도 (Admin 권한으로 email_confirm: true 설정)
                const { data: _createUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: email,
                    password: fakePassword,
                    email_confirm: true, // 핵심: 이메일 인증 자동 완료
                    user_metadata: {
                        full_name: naverUser.name || naverUser.nickname,
                        phone: naverUser.mobile || naverUser.mobile_e164,
                        avatar_url: naverUser.profile_image,
                        login_provider: 'naver'
                    }
                })

                if (createError) {
                    // 이미 존재하는 유저라면 비밀번호를 업데이트해서 로그인 가능하게 처리
                    console.log('User exists, attempting to update password...')

                    // 1. 유저 ID 찾기
                    const { data: { users }, error: _findError } = await supabaseAdmin.auth.admin.listUsers()
                    const existingUser = users?.find(u => u.email === email)

                    if (existingUser) {
                        // 2. 비밀번호 강제 업데이트 (Naver 계정으로 연동 효과)
                        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                            existingUser.id,
                            {
                                password: fakePassword,
                                email_confirm: true,
                                user_metadata: {
                                    ...existingUser.user_metadata,
                                    full_name: naverUser.name || naverUser.nickname,
                                    phone: naverUser.mobile || naverUser.mobile_e164,
                                    avatar_url: naverUser.profile_image,
                                    login_provider: 'naver'
                                }
                            }
                        )

                        if (updateError) {
                            console.error('Update User Error:', updateError)
                            return NextResponse.redirect(`${origin}/login?error=update_failed`)
                        }

                        // 3. 로그인 재시도
                        const { error: retryError2 } = await supabase.auth.signInWithPassword({
                            email,
                            password: fakePassword
                        })

                        if (retryError2) {
                            console.error('Retry Login After Update Error:', retryError2)
                            return NextResponse.redirect(`${origin}/login?error=retry_login_failed`)
                        }
                    } else {
                        console.error('Create User Error (User not found in list):', createError)
                        return NextResponse.redirect(`${origin}/login?error=email_exists_use_password`)
                    }
                } else {
                    // 유저 생성 성공 시 바로 로그인 재시도
                    const { error: retryError } = await supabase.auth.signInWithPassword({
                        email,
                        password: fakePassword
                    })

                    if (retryError) {
                        console.error('Retry Login Error:', retryError)
                        return NextResponse.redirect(`${origin}/login?error=retry_login_failed`)
                    }
                }
            }

            // 6. 프로필 테이블 동기화 및 필수 정보 확인
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    name: naverUser.name || naverUser.nickname,
                    phone: naverUser.mobile || naverUser.mobile_e164,
                    avatar_url: naverUser.profile_image
                })

                // 프로필 정보 확인 (이름, 전화번호 누락 시 입력 페이지로 이동)
                const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('name, phone, role')
                    .eq('id', user.id)
                    .single()

                if (currentProfile) {
                    if (!currentProfile.name || !currentProfile.phone) {
                        return NextResponse.redirect(`${origin}/complete-profile`)
                    }

                    // 관리자/사장님 리다이렉트 처리
                    if (currentProfile.role === 'admin' || currentProfile.role === 'owner') {
                        return NextResponse.redirect(`${origin}/admin`)
                    }
                }
            }

            return NextResponse.redirect(`${origin}/`)

        } catch (error) {
            console.error('Naver Callback Logic Error:', error)
            return NextResponse.redirect(`${origin}/login?error=unknown_naver_error`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=no_code`)
}
