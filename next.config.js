/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
  images: {
    domains: [
      "localhost",
      "bootcamp-pharry.s3.us-west-1.amazonaws.com",
      "bootcamp-pharry.s3.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
