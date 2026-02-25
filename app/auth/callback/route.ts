import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveRoute } from '@/lib/routing'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error, data: { session } } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session) {
            // Logic for profile creation/syncing can go here or be handled in a separate step
            // For now, let's establish the session and handle redirection

            // We retrieve the intended role from user_metadata (since it might have been set during signup)
            // Or we can rely on what's in the DB if they already exist.

            const role = (session.user.user_metadata?.role as string | undefined)?.toLowerCase() || 'patient'

            // Check if profile exists; if not, you might want to redirect to a profile completion page
            // or handle it here. For simplicity and parity with original logic:

            const profileRes = await fetch(`${origin}/api/auth/profile?userId=${session.user.id}`)
            let verificationStatus: string | undefined;

            if (profileRes.status === 404) {
                // Create profile if missing
                const userMeta = session.user.user_metadata || {}
                const registrationData = {
                    userId: session.user.id,
                    email: session.user.email,
                    role: role,
                    authProvider: session.user.app_metadata?.provider || 'google',
                    fullName: userMeta.full_name || userMeta.name || session.user.email?.split('@')[0],
                    avatarUrl: userMeta.avatar_url || userMeta.picture,
                }

                await fetch(`${origin}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registrationData)
                })
                verificationStatus = 'pending'
            } else {
                const profileData = await profileRes.json()
                if (profileData.success && profileData.data.profile) {
                    verificationStatus = profileData.data.profile.verification_status
                }
            }

            const targetPath = resolveRoute(role, verificationStatus)
            const forwardTo = next !== '/' ? next : targetPath

            return NextResponse.redirect(`${origin}${forwardTo}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
