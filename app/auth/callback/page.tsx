'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { resolveRoute } from '@/lib/routing'

export default function AuthCallbackPage() {
    const router = useRouter()
    const { setUserRole, connectWallet } = useAppStore()
    const [status, setStatus] = useState('Authenticating...')

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // First check for errors in the URL (Supabase appends them as fragments or params on failure)
                const hash = window.location.hash
                const params = new URLSearchParams(window.location.search)
                const hashParams = new URL(window.location.href.replace('#', '?')).searchParams

                const errorName = params.get('error') || hashParams.get('error')
                const errorDescription = params.get('error_description') || hashParams.get('error_description')

                if (errorName) {
                    throw new Error(errorDescription || errorName)
                }

                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error
                if (!session) {
                    // Check if we just need to wait a bit for the session to be established
                    // if there's a 'code' in the URL (PKCE)
                    if (params.get('code')) {
                        setStatus('Exchanging code for session...')
                        // Supabase client usually handles this automatically on load
                        // but we can add a small delay or check again
                        await new Promise(resolve => setTimeout(resolve, 500))
                        const { data: { session: retrySession } } = await supabase.auth.getSession()
                        if (retrySession) {
                            processSession(retrySession)
                            return
                        }
                    }
                    router.push('/auth')
                    return
                }

                await processSession(session)

            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
                console.error('Auth callback error:', error);
                toast.error('Auth failed', { description: errorMessage });

                // If it's an OTP error, give more specific advice
                if (errorMessage.toLowerCase().includes('otp_expired')) {
                    toast.info('Link Expired', {
                        description: 'Email verification links can only be used once. Please try signing up again or check if your email provider is pre-clicking the link.'
                    });
                }

                router.push('/auth')
            }
        }

        const processSession = async (session: any) => {
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
            let verificationStatus: string | undefined;

            if (profileRes.status === 404) {
                setStatus('Creating your profile...')

                // Get doctor-specific data from user metadata (stored during signup)
                const userMeta = session.user.user_metadata || {};

                const registrationData = {
                    userId: session.user.id,
                    email: session.user.email,
                    role: role,
                    authProvider: session.user.app_metadata?.provider || 'email',
                    fullName: userMeta.full_name || userMeta.name || session.user.email?.split('@')[0],
                    avatarUrl: userMeta.avatar_url || userMeta.picture,
                    ...(role === 'hospital' && { hospitalName: 'Medical Facility' }),
                    ...(role === 'doctor' && {
                        firstName: userMeta.first_name || userMeta.full_name?.split(' ')[0] || 'Doctor',
                        lastName: userMeta.last_name || userMeta.full_name?.split(' ').slice(1).join(' ') || 'User',
                        medicalLicenseNumber: userMeta.medical_license || `PENDING-${session.user.id.slice(0, 8)}`,
                        specialty: userMeta.specialty || 'General Practice',
                        primaryHospitalId: userMeta.hospital_id || null
                    })
                }

                const registerRes = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationData)
                })

                if (!registerRes.ok && registerRes.status !== 409) {
                    const errorData = await registerRes.json();
                    console.error('Registration failed:', errorData);
                    throw new Error(errorData.message || 'Failed to create profile')
                }
                toast.success('Account created!');
                verificationStatus = 'pending'; // New registrations are pending
            } else {
                const profileData = await profileRes.json();
                if (profileData.success) {
                    if (profileData.data.user && !profileData.data.profile) {
                        setStatus('Completing profile setup...')
                        const userMeta = session.user.user_metadata || {};
                        const registrationData = {
                            userId: session.user.id,
                            email: session.user.email,
                            role: role,
                            authProvider: 'email',
                            ...(role === 'doctor' && {
                                firstName: userMeta.first_name || 'Doctor',
                                lastName: userMeta.last_name || 'User',
                                medicalLicenseNumber: userMeta.medical_license || `PENDING-${session.user.id.slice(0, 8)}`,
                                specialty: userMeta.specialty || 'General Practice'
                            })
                        };
                        await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(registrationData)
                        });
                        verificationStatus = 'pending';
                    } else if (profileData.data.profile) {
                        verificationStatus = profileData.data.profile.verification_status;
                    }
                }
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

            // Centralized Redirection Logic
            const targetPath = resolveRoute(role, verificationStatus);
            router.push(targetPath);
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
