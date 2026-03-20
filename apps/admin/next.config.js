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
};

module.exports = nextConfig;
```

---

**Fix 4 — Add all missing env variables in Vercel**

Make sure every single one of these is in Vercel environment variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ENDPOINT
R2_PUBLIC_URL
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_REPLY_TO
NEXT_PUBLIC_ADMIN_URL
NEXT_PUBLIC_TEACHER_APP_URL
