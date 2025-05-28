import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // 关闭开发环境的错误覆盖层
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // 禁用错误覆盖层
  onError: () => {},
  // 关闭严格模式
  reactStrictMode: false,
};

export default nextConfig;
