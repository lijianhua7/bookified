import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // 根据你的 PDF 文件大小需求进行调整
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "mgjacvezc1sbmenp.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
