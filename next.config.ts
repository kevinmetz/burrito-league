import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    USE_MOCK_DATA: process.env.USE_MOCK_DATA,
  },
};

export default nextConfig;
