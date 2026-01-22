'use client'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygonAmoy } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAppStore } from '@/lib/store'
import { Session } from '@supabase/supabase-js'
import { RoleSelectionModal } from '@/components/features/RoleSelectionModal'

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '68616142c94380e60802c6109968453b' // Fallback to public demo ID, but highly recommended to use your own!

// 2. Create Wagmi Adapter
const networks = [polygonAmoy]
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true
})

// 3. Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [polygonAmoy],
  projectId,
  metadata: {
    name: 'HealthChain',
    description: 'Secure Medical Records',
    url: 'https://healthchain.com', // Ensure this matches your generic domain whitelist if applicable
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  features: {
    analytics: true,
    socials: ['google', 'x', 'github', 'discord'],
    email: true, // This requires the Embedded Wallet (which was failing to load)
  }
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const { setSession, setUserRole, userRole } = useAppStore()
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [session, setLocalSession] = useState<Session | null>(null)

  useEffect(() => {
    const syncUserMetadata = async (session: Session | null) => {
      if (!session?.user) {
        setLocalSession(null)
        return
      }
      setLocalSession(session)

      // Check users table for role if not in metadata
      let role = session.user.user_metadata?.role

      if (!role) {
        // Double check database if metadata is empty
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (data?.role) {
          role = data.role
        }
      }

      if (role) {
        // Role exists, update store
        const normalizedRole = role === 'hospital' ? 'Hospital' : 'Patient'
        setUserRole(normalizedRole)
      } else {
        // No role found anywhere, show selection modal
        setShowRoleModal(true)
      }
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      syncUserMetadata(session)
    })

    // 2. Listen for Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN') {
        syncUserMetadata(session)
      } else if (event === 'SIGNED_OUT') {
        setLocalSession(null)
        setShowRoleModal(false)
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setUserRole])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RoleSelectionModal
          open={showRoleModal}
          onClose={() => setShowRoleModal(false)}
        />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
