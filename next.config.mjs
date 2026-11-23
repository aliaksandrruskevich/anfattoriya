import 'dotenv/config';
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // Проверка типов на билде. Раскомментируйте ignoreBuildErrors только если нужно срочно.
  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'realt.by' },
      { protocol: 'http', hostname: 'realt.by' },
      { protocol: 'https', hostname: 'files.realt.by' },
      { protocol: 'http', hostname: 'files.realt.by' },
      { protocol: 'https', hostname: 'unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [16, 32, 64, 128, 200, 400],
    qualities: [75, 80, 90, 100],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ============================================================
  // 301-редиректы для удалённых страниц
  // ============================================================
  async redirects() {
    return [
      // Удалённые страницы оценки → на /ocenka-kvartiry (301 permanent)
      { source: '/ocenka-doma-dachi', destination: '/ocenka-kvartiry', permanent: true },
      { source: '/ocenka-kommercheskoj', destination: '/ocenka-kvartiry', permanent: true },
      { source: '/ocenka-uchastka', destination: '/ocenka-kvartiry', permanent: true },
    ];
  },

  async headers() {
    return [
      // Логотип и favicon — кэш на год (не меняются)
      {
        source: '/logo.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:icon(android-chrome-.*\\.png|favicon-.*\\.png)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Фото объектов и агентов — кэш на год (файлы уникальны по slug)
      {
        source: '/photo/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Security headers для всех страниц
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
};

export default nextConfig;