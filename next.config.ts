import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  async rewrites() {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:5000";

    return [
      {
        source: "/auth/:path*",
        destination: `${authServiceUrl}/auth/:path*`,
      },
      {
        source: "/user/:path*",
        destination: `${authServiceUrl}/user/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${authServiceUrl}/admin/:path*`,
      },
      {
        source: "/health",
        destination: `${authServiceUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
