/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@educore/types",
    "@educore/firebase",
    "@educore/utils",
    "@educore/email",
    "@educore/ui",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/destinydriving/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
};

module.exports = nextConfig;
