/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'mbu.ug', 'images.unsplash.com', 'artist.mwonyaa.com', 'wallpapers.com', 'lh3.googleusercontent.com', 'mwonya-kasfa-assets-store.s3.us-east-1.amazonaws.com', 'assets.mwonya.com', 'artist.mwonya.com', 'www.promptengineering.org'],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Adjust this as needed
    },
  },
};

export default nextConfig;
