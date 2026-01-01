
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({
  reactStrictMode: true,
  experimental: {
    // View Transitions API - 페이지 전환 애니메이션
    viewTransition: true,
  },
  turbopack: {
    // Serwist is disabled in dev, so we can ignore its webpack config
  },
});

