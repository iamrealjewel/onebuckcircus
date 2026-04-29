import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Next.js 15+ allows this for dev network access
  allowedDevOrigins: ["192.168.20.17", "localhost:3000"]
};

export default nextConfig;
