import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
