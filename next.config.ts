// D:\Shop\oversize\next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: { // <--- ДОБАВЬТЕ ЭТОТ БЛОК
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'project-files.picsart.com',
        port: '',
        pathname: '/**',
      },
      // Добавьте другие хосты при необходимости
    ],
  },
};

export default nextConfig;