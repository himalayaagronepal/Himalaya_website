import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/about-us/who-we-are',
        permanent: true,
      },
      {
        source: '/investor',
        destination: '/about-us/investor-relations',
        permanent: true,
      },
    ];
  },
  async headers() {
    // Files in /public are served by Vercel with `max-age=0, must-revalidate`
    // by default, which forces a revalidation on every byte-range request and
    // re-download on repeat visits — bad for streaming media. These hero assets
    // never change in place (re-encodes should use a new filename), so cache
    // them aggressively to remove that overhead on the self-hosted fallback path.
    const immutable = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ];

    const isDev = process.env.NODE_ENV !== 'production';

    // Conservative CSP tuned to the assets this app actually loads:
    //  - media: Cloudinary (hero video) + self fallback
    //  - img: https: (Cloudinary product images, Unsplash on company pages, gstatic flags)
    //  - frame: Google Maps embeds (contact + outlet), Google Translate, the eSewa gateway
    //  - form-action: eSewa hosts (the pay page POSTs a real <form> to eSewa)
    //  - Google Translate (site-wide LanguageWidget) needs its script/style/xhr hosts
    //    plus 'unsafe-eval' (its element.js evals); Next.js inline bootstrap + next/font +
    //    framer-motion need 'unsafe-inline'. ws: is dev-only (HMR). A nonce-based stricter
    //    policy is a future hardening step (would require middleware + dropping unsafe-eval).
    // Google's own subdomains are wildcarded because the Translate widget pulls from
    // several (translate.google.com, translate-pa.googleapis.com, www.gstatic.com, …).
    const google = 'https://*.google.com https://*.googleapis.com https://*.gstatic.com';
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https://res.cloudinary.com",
      'font-src \'self\' data: https://*.gstatic.com',
      `style-src 'self' 'unsafe-inline' https://*.gstatic.com https://*.googleapis.com`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${google}`,
      `connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com ${google}${isDev ? ' ws: wss:' : ''}`,
      `frame-src 'self' https://*.google.com https://rc-epay.esewa.com.np https://epay.esewa.com.np`,
      "form-action 'self' https://rc-epay.esewa.com.np https://epay.esewa.com.np",
      "worker-src 'self' blob:",
    ].join('; ');

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // HSTS is ignored by browsers over plain HTTP (localhost dev), so it is safe to always send.
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];

    return [
      { source: '/:path*', headers: securityHeaders },
      // /farms hero (new "hariyali" video) — self-hosted fallback + poster.
      { source: '/hariyali_farms_opt_v1.mp4', headers: immutable },
      { source: '/hariyali_farms_poster_v1.jpg', headers: immutable },
      // Former /farms hero, now the Poultry banner background + its poster.
      { source: '/himalaya_agro_bg_opt_v2.mp4', headers: immutable },
      { source: '/himalaya_agro_poster_v2.jpg', headers: immutable },
    ];
  },
};

export default nextConfig;
