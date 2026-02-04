/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'umutoza-umutoza.hf.space',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Required for Cloudflare Pages if not using a custom loader
  },
};

export default nextConfig;
