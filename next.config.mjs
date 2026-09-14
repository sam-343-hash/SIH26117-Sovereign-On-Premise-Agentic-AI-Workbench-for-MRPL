/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Launcher-started development servers use an isolated generated cache.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
