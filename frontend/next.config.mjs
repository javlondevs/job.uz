/** @type {import('next').NextConfig} */
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: `${API}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
