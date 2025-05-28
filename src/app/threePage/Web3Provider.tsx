'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { defineChain } from 'viem';

// 定义本地区块链网络
const localhost = defineChain({
  id: 1337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:7545'],
    },
    public: {
      http: ['http://127.0.0.1:7545'],
    },
  },
});

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [localhost, mainnet],
    transports: {
      // RPC URL for each chain
      // [mainnet.id]: http(
      //   `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID || 'demo'}`,
      // ),
      [localhost.id]: http('http://127.0.0.1:7545'),
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',

    // Required App Info
    appName: 'Your App Name',

    // Optional App Info
    appDescription: 'Your App Description',
    appUrl: 'https://family.co', // your app's url
    appIcon: 'https://family.co/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

const Web3Provider = ({ children }: React.PropsWithChildren) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default Web3Provider;
