/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Image optimization is on by default; add remote patterns here if you
  // later serve mover/company logos or hero photography from a CDN.
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
