/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  basePath: "/grace-lab",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
