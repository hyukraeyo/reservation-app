'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './complete-profile.module.scss'
import LoadingSpinner from '@/app/components/LoadingSpinner'

export default function CompleteProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    })
    const [needsUpdate, setNeedsUpdate] = useState({
        name: false,
        phone: false
    })

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace('/login')
                return
            }
            setUserId(user.id)

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                if (profile.name && profile.phone) {
                    router.replace('/')
                    return
                }

                setNeedsUpdate({
                    name: !profile.name,
                    phone: !profile.phone
                })

                setFormData({
                    name: profile.name || '',
                    phone: profile.phone || ''
                })
            }
            setLoading(false)
        }

        checkProfile()
    }, [router, supabase])

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let formatted = '';

        if (value.length <= 3) {
            formatted = value;
        } else if (value.length <= 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
        }

        setFormData(prev => ({ ...prev, phone: formatted }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
            }

            const updates: any = {
                updated_at: new Date().toISOString()
            }

            // 입력된 값이 있다면 업데이트에 포함
            if (formData.name && formData.name.trim()) updates.name = formData.name
            if (formData.phone && formData.phone.trim()) updates.phone = formData.phone

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) {
                throw error
            }

            router.refresh()
            router.replace('/')

        } catch (error: any) {
            console.error('Profile update error:', error)
            alert('저장 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'))
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <LoadingSpinner size="large" />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {saving && (
                    <div className={styles.loadingOverlay}>
                        <LoadingSpinner size="medium" />
                    </div>
                )}

                <div className={styles.header}>
                    <h1>추가 정보 입력</h1>
                    <p>원활한 서비스 이용을 위해<br />나머지 정보를 입력해주세요.</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {needsUpdate.name && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">이름</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="홍길동"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                    )}

                    {needsUpdate.phone && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="phone">전화번호</label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="010-0000-0000"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                required
                                maxLength={13}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={saving}
                    >
                        {saving ? '저장 중...' : '시작하기'}
                    </button>
                </form>
            </div>
        </div>
    )
}
