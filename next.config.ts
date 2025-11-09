import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "slime-simulation"; // <-- your repo name

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: { unoptimized: true },
  compiler: {
    define: {
      Float16Array: "{}",
      GPUShaderStage: "{}",
    },
  },
  turbopack: {
    rules: {
      "*.wgsl": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.svg": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
