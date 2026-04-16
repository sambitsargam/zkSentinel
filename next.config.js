/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Handle snarkjs for client-side usage
    config.externals = config.externals || [];
    if (config.isServer) {
      // Allow snarkjs on server side
    } else {
      // Handle snarkjs on client side
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
