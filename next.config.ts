import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native Node addon; load it from node_modules at
  // runtime instead of bundling it.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
