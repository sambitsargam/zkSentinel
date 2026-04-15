// Run startup validation before building
if (process.env.NODE_ENV !== 'test') {
  const { runStartupValidation } = require('./lib/startup');
  runStartupValidation();
}

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
    return config;
  },
};

module.exports = nextConfig;
