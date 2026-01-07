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
  const { setSession, setUserRole } = useAppStore()

  useEffect(() => {
    const syncUserMetadata = async (session: Session | null) => {
      if (!session?.user) return

      const storedRole = localStorage.getItem('healthchain_intended_role')
      if (storedRole) {
        console.log("Syncing stored role to user metadata:", storedRole)
        await supabase.auth.updateUser({
          data: { role: storedRole.toLowerCase() }
        })
        localStorage.removeItem('healthchain_intended_role')
        setUserRole(storedRole as any)
      } else if (session.user.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role === 'hospital' ? 'Hospital' : 'Patient')
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
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setUserRole])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
