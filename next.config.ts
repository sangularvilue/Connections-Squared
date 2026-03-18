import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack for build (UNC path issues on network drives)
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
