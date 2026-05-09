/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { webpack, isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
      };
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
