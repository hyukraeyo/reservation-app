
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 로그인 후 이동할 페이지 (기본값: 메인 화면 '/')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && session) {
        // Fetch extended profile data directly from Kakao API
        let kakaoData: any = {};
        if (session.provider_token) {
          try {
            const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
              headers: {
                Authorization: `Bearer ${session.provider_token}`,
              },
            });
            const kakaoJson = await kakaoResponse.json();
            kakaoData = kakaoJson.kakao_account || {};
            
          } catch (fetchError) {
            console.error('Failed to fetch from Kakao API:', fetchError);
          }
        }

        const meta = user.user_metadata;
        
        try {
          // Prioritize direct Kakao data, fall back to metadata
          const profileData = {
            id: user.id,
            email: user.email,
            name: meta.full_name || meta.name || kakaoData.profile?.nickname || meta.nickname,
            avatar_url: meta.avatar_url || meta.picture || kakaoData.profile?.profile_image_url,
            phone: kakaoData.phone_number || meta.phone_number || meta.phone,
            gender: kakaoData.gender || meta.gender,
            age_range: kakaoData.age_range || meta.age_range,
            birthday: kakaoData.birthday || meta.birthday,
            birthyear: kakaoData.birthyear || meta.birthyear,
          };
          
          await supabase.from('profiles').upsert(profileData)
        } catch (upsertError) {
          console.error('Extended profile update failed, falling back to basic:', upsertError);
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
          })
        }

        // Check for user role to determine redirect
        let finalRedirect = next;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (profile && (profile.role === 'admin' || profile.role === 'owner')) {
            finalRedirect = '/admin';
          }
        } catch (roleError) {
          console.error('Failed to check user role:', roleError);
        }

        return NextResponse.redirect(`${origin}${finalRedirect}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
