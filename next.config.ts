import type { NextConfig } from "next";

const HARDCODED_FALLBACK = "https://safepulse-production-4e0d.up.railway.app";
const apiBaseUrl = process.env.API_BASE_URL || HARDCODED_FALLBACK;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Added: Force Next.js 15 to aggressively tree-shake barrel imports
  // This prevents hooks from leaking into static pages like /activity
  optimizePackageImports: ["lucide-react", "@/components/ui", "@/utils"],

  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
