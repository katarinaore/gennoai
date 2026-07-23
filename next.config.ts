import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for efficient Docker/Coolify deploys.
  output: "standalone",
};

export default nextConfig;
