import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const rainbowKitConfig = {
  // 自定义主题
  theme: {
    accentColor: '#3b82f6', // 蓝色主题
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
  },
  
  // 自定义钱包列表
  wallets: [
    {
      groupName: '推荐',
      wallets: [
        // 这里可以添加自定义钱包
      ],
    },
  ],
  
  // 自定义链配置
  chains: [
    // 在 providers.tsx 中配置
  ],
  
  // 应用信息
  appInfo: {
    appName: 'NFT Market',
    appDescription: '使用 RainbowKit 的 NFT 市场',
    appUrl: 'https://nftmarket.com',
    appIcon: 'https://avatars.githubusercontent.com/u/179229932',
  },
  
  // 其他配置
  coolMode: true,
  showRecentTransactions: true,
}; 