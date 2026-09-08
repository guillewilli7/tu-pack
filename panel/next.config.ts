import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La imagen de producción copia solo .next/standalone: sin node_modules.
  output: "standalone",
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
