import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時のESLintを無効化（警告のみ）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ビルド時のTypeScriptエラーチェックを無効化（一時的）
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/house-builder',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
