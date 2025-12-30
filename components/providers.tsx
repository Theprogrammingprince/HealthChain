'use client'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygonAmoy } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ReactNode, useState } from 'react'
import dynamic from 'next/dynamic'

const AuthDialog = dynamic(() => import('@/components/features/AuthDialog').then(mod => mod.AuthDialog), {
  ssr: false,
})

// 1. Get projectId from https://cloud.reown.com
// This is a public demo project ID
const projectId = '68616142c94380e60802c6109968453b'

// 2. Create Wagmi Adapter
const networks = [polygonAmoy]
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

// 3. Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [polygonAmoy],
  projectId,
  metadata: {
    name: 'HealthChain',
    description: 'Secure Medical Records',
    url: 'https://healthchain.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  features: {
    analytics: true,
    socials: ['google', 'x', 'github', 'discord', 'apple'],
    email: true,
  }
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <AuthDialog />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
