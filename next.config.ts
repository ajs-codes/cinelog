import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "image.tmdb.org",
        protocol: "https",
      }
    ],
  },
};

export default nextConfig;
