import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid flaky filesystem cache corruption during frequent restarts/cleans.
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
