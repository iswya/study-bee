import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep recently visited pages in the browser for 30s so switching tabs
    // (Home ↔ Library ↔ a set) is instant. Saving anything refreshes them.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
