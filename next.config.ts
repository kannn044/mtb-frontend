import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: process.env.NODE_ENV === 'development' ? '' : '/mtbcluster',
	experimental: process.env.NODE_ENV === "development" ? { proxyClientMaxBodySize: "500mb" } : {},
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];

    return [
      // Keep NextAuth API routes handled by Next.js
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
			// Uploads are handled by the App Router route handler (streaming proxy)
			{
				source: "/api/upload/:path*",
				destination: "/api/upload/:path*",
			},
      // Downloads are handled by the App Router route handler (proxy)
      {
        source: "/api/download/:path*",
        destination: "/api/download/:path*",
      },
      // Proxy other API calls to the local backend in dev
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
