'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function AuthCallbackPage() {
    const router = useRouter()
    const { setUserRole } = useAppStore()

    useEffect(() => {
        const handleCallback = async () => {
            // Supabase handles the session exchange automatically if the client is initialized
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth callback error:', error.message)
                router.push('/signin?error=' + encodeURIComponent(error.message))
                return
            }

            if (session) {
                // Retrieve the intended role we saved earlier
                const storedRole = localStorage.getItem('healthchain_intended_role')
                const role = session.user.user_metadata?.role || (storedRole?.toLowerCase()) || 'patient'

                // Update user metadata if it's missing (helps future logins)
                if (!session.user.user_metadata?.role && storedRole) {
                    await supabase.auth.updateUser({
                        data: { role: storedRole.toLowerCase() }
                    })
                    localStorage.removeItem('healthchain_intended_role')
                }

                // Redirect based on role
                if (role === 'hospital') {
                    setUserRole('Hospital')
                    router.push('/clinical')
                } else {
                    setUserRole('Patient')
                    router.push('/dashboard')
                }
            } else {
                // No session found, return to signin
                router.push('/signin')
            }
        }

        handleCallback()
    }, [router, setUserRole])

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Completing Sign In</h2>
                    <p className="text-gray-400 text-sm max-w-xs">
                        Establishing secure connection to HealthChain Protocol...
                    </p>
                </div>
            </div>
        </div>
    )
}
