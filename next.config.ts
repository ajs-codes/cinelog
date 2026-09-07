import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "image.tmdb.org",
        protocol: "https",
      },
      {
        hostname: "www.figma.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
