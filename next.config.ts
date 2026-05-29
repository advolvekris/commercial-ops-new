import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/commercial-ops-new",
  assetPrefix: "/commercial-ops-new",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
