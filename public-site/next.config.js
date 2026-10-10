/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,
  },
  // GitHub Pages 仓库路径前缀（如果需要）
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

module.exports = nextConfig;
