/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-21 14:13:06
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-22 21:46:17
 * @FilePath: /web3-test-front/viem-front/app/providers.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { foundry } from 'wagmi/chains';

const config = createConfig({
  chains: [foundry],
  transports: {
    [foundry.id]: http(),
  },
});

const wagmiAdapter = new WagmiAdapter({
  networks: [foundry],
  projectId: 'YOUR_PROJECT_ID', // 请替换为你的 WalletConnect Project ID
  ssr: true
});

const metadata = {
  name: 'NFTMarket',
  description: 'NFT Market with AppKit',
  url: 'https://nftmarket.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 创建 AppKit 实例
createAppKit({
  adapters: [wagmiAdapter],
  networks: [foundry],
  projectId: 'YOUR_PROJECT_ID', // 请替换为你的 WalletConnect Project ID
  metadata,
  themeMode: 'light',
  features: {
    analytics: true
  }
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 