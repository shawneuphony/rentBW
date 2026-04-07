/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    // Allow Next.js <Image> to serve from the local /uploads path
    remotePatterns: [],
    localPatterns: [
      { pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
