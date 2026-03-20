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
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
};

module.exports = nextConfig;
```

This is shorter than before — I removed `pathname` from remotePatterns which can cause issues, and removed the experimental block entirely.

---

**Also go back to simpler Vercel settings:**

Vercel → Settings → General:
```
Root Directory:   apps/admin
Build Command:    (leave empty)
Install Command:  (leave empty)
