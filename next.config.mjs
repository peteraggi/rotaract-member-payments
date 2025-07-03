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
    missingSuspenseWithCSRBailout: false,
    serverActions: {
      bodySizeLimit: '10mb', // Adjust this as needed
    },
  },
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Allowed-IPs',
            value: '0.0.0.0, 127.0.0.1', // Replace with your IP(s)
          },
        ],
      },
    ];
  },
  async redirects() {
    return []
  }
};

export default nextConfig;
