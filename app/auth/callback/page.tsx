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
                // Get the session from Supabase
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Auth callback error:', error.message)
                    toast.error('Authentication failed', {
                        description: error.message
                    })
                    router.push('/signin?error=' + encodeURIComponent(error.message))
                    return
                }

                if (!session) {
                    router.push('/signin')
                    return
                }

                setStatus('Setting up your account...')

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

                // Check if user exists in our database
                const checkResponse = await fetch(`/api/auth/profile?userId=${session.user.id}`)
                const checkData = await checkResponse.json()

                // If user doesn't exist, create their profile
                if (checkResponse.status === 404 || !checkData.data) {
                    setStatus('Creating your profile...')

                    // Prepare registration data
                    const registrationData = {
                        userId: session.user.id,
                        email: session.user.email || null,
                        walletAddress: null, // Will be set if they connect wallet later
                        role: role,
                        authProvider: 'google', // Assuming Google OAuth for now
                        fullName: session.user.user_metadata?.full_name ||
                            session.user.user_metadata?.name ||
                            null,
                        avatarUrl: session.user.user_metadata?.avatar_url ||
                            session.user.user_metadata?.picture ||
                            null,
                        // Hospital-specific
                        ...(role === 'hospital' && {
                            hospitalName: session.user.user_metadata?.organization ||
                                session.user.email?.split('@')[1]?.split('.')[0] ||
                                'Medical Facility'
                        })
                    }

                    // Call registration API
                    const registerResponse = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(registrationData)
                    })

                    const registerData = await registerResponse.json();

                    if (!registerResponse.ok && registerResponse.status !== 409) {
                        // Check if it's a database setup error
                        if (registerResponse.status === 503 || registerData.error?.includes('Database tables')) {
                            toast.error('Database Not Set Up', {
                                description: 'Please create the database tables in Supabase. See SETUP_CHECKLIST.md',
                                duration: 10000
                            });
                            throw new Error('Database tables not created. Please set up Supabase tables first.');
                        }

                        throw new Error(registerData.message || registerData.error || 'Failed to create profile');
                    }

                    toast.success('Welcome to HealthChain!', {
                        description: 'Your account has been created successfully'
                    });
                } else {
                    toast.success('Welcome back!', {
                        description: 'Successfully signed in'
                    })
                }

                // Update Zustand store
                if (role === 'hospital') {
                    setUserRole('Hospital')
                } else {
                    setUserRole('Patient')
                }

                // If user has email, we can consider them authenticated
                if (session.user.email) {
                    connectWallet(session.user.email.slice(0, 10) + '...')
                }

                setStatus('Redirecting...')

                // Redirect based on role
                setTimeout(() => {
                    if (role === 'hospital') {
                        router.push('/clinical')
                    } else {
                        router.push('/dashboard')
                    }
                }, 500)

            } catch (error: any) {
                console.error('Callback processing error:', error)
                toast.error('Setup failed', {
                    description: error.message
                })
                router.push('/signin')
            }
        }

        handleCallback()
    }, [router, setUserRole, connectWallet])

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{status}</h2>
                    <p className="text-gray-400 text-sm max-w-xs">
                        Establishing secure connection to HealthChain Protocol...
                    </p>
                </div>
            </div>
        </div>
    )
}
