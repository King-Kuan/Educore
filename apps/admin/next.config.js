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
    domains: ["ik.imagekit.io"],
  },
};

module.exports = nextConfig;
