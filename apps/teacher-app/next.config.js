const withPWA = require("next-pwa")({
  dest:            "public",
  register:        true,
  skipWaiting:     true,
  disable:         process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Cache Firebase calls
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com/,
      handler:    "NetworkFirst",
      options:    { cacheName: "firestore-cache", networkTimeoutSeconds: 10 },
    },
    // Cache app pages
    {
      urlPattern: /^\//,
      handler:    "StaleWhileRevalidate",
      options:    { cacheName: "pages-cache" },
    },
    // Cache assets
    {
      urlPattern: /\.(js|css|png|jpg|jpeg|svg|ico)$/,
      handler:    "CacheFirst",
      options:    { cacheName: "assets-cache", expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
    // Cache ImageKit images
    {
      urlPattern: /^https:\/\/ik\.imagekit\.io/,
      handler:    "CacheFirst",
      options:    { cacheName: "images-cache", expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 } },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@educore/types", "@educore/firebase", "@educore/utils"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "ik.imagekit.io" }],
  },
};

module.exports = withPWA(nextConfig);
