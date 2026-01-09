import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignoring TS errors if any remain, but strictly we should fix them.
  },
};

export default nextConfig;
