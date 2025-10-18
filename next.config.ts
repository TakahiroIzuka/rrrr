import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/clinic',
        destination: '/medical',
        permanent: true,
      },
      {
        source: '/clinic/:path*',
        destination: '/medical/:path*',
        permanent: true,
      },
      {
        source: '/clinics',
        destination: '/medical/list',
        permanent: true,
      },
      {
        source: '/clinics/:path*',
        destination: '/medical/list/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
