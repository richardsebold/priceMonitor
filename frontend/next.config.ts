import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // O "**" libera imagens de qualquer site HTTPS
      },
    ],
  },
};

export default nextConfig;
