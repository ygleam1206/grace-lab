/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
  output: "export",
  distDir: "out",
  basePath: "/grace-lab",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
