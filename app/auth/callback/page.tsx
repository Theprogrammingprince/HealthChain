'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
    const router = useRouter()
    const { setUserRole, connectWallet } = useAppStore()
    const [status, setStatus] = useState('Authenticating...')

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error
                if (!session) {
                    router.push('/auth')
                    return
                }

                setStatus('Setting up your account...')

                // Retrieve the intended role
                const storedRole = localStorage.getItem('healthchain_intended_role')
                const role = session.user.user_metadata?.role || storedRole?.toLowerCase() || 'patient'

                // Update metadata if missing
                if (!session.user.user_metadata?.role && storedRole) {
                    await supabase.auth.updateUser({
                        data: { role: storedRole.toLowerCase() }
                    })
                }

                // Check if profile exists
                const profileRes = await fetch(`/api/auth/profile?userId=${session.user.id}`)

                if (profileRes.status === 404) {
                    setStatus('Creating your profile...')
                    const registrationData = {
                        userId: session.user.id,
                        email: session.user.email,
                        role: role,
                        authProvider: 'google',
                        fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                        avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                        ...(role === 'hospital' && { hospitalName: 'Medical Facility' })
                    }

                    const registerRes = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(registrationData)
                    })

                    if (!registerRes.ok && registerRes.status !== 409) {
                        throw new Error('Failed to create profile')
                    }
                    toast.success('Account created!');
                } else {
                    toast.success('Welcome back!');
                }

                // Update store
                const finalRole = role.charAt(0).toUpperCase() + role.slice(1)
                setUserRole(finalRole as any)

                if (session.user.email) {
                    connectWallet(session.user.email.split('@')[0])
                }

                localStorage.removeItem('healthchain_intended_role')
                setStatus('Redirecting...')

                // Redirection Logic
                if (role === 'admin') {
                    router.push('/admin')
                } else if (role === 'hospital') {
                    router.push('/clinical')
                } else {
                    router.push('/dashboard')
                }

            } catch (error: any) {
                console.error('Callback error:', error)
                toast.error('Auth failed', { description: error.message })
                router.push('/auth')
            }
        }

        handleCallback()
    }, [router, setUserRole, connectWallet])

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-[0.2em]">{status}</h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-xs">
                        Establishing secure connection...
                    </p>
                </div>
            </div>
        </div>
    )
}
