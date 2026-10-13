import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Keep Vercel builds green even if ESLint plugins mis-resolve in CI
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
