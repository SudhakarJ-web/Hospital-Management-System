/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/doctor",
        destination: "/dashboard/doctor-ananya-rao",
        permanent: false,
      },
      {
        source: "/doctor-:slug",
        destination: "/dashboard/doctor-:slug",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;