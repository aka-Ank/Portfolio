import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project so Turbopack doesn't walk up
  // into unrelated lockfiles/package.json files sitting above it (e.g. in
  // the home directory).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
