import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up looking for a
  // lockfile and can latch onto an unrelated one in a parent directory.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
