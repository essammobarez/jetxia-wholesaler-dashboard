/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http", // Update to "http" instead of "https"
        hostname: "cdn.smyrooms.com", // Specific hostname
      },
      {
        protocol: "https", // Optional: Use for other domains that require HTTPS
        hostname: "**", // Wildcard for other domains if needed
      },
    ],
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
