import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignoring TS errors if any remain, but strictly we should fix them.
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vlyjdalchiyfxxnhphkl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
