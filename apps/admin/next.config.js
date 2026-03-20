/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@educore/types",
    "@educore/firebase",
    "@educore/utils",
    "@educore/email",
    "@educore/ui",
  ],
  serverExternalPackages: ["firebase-admin"],
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
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
