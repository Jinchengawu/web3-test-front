'use client';

import { useAppKitNetwork } from '@reown/appkit/react';
import { foundry } from 'wagmi/chains';

export default function ConnectionStatus() {
  const { chainId } = useAppKitNetwork();

  const getNetworkInfo = (chainId: string | number | undefined) => {
    if (!chainId) {
      return {
        name: '未连接',
        color: 'bg-gray-500',
        textColor: 'text-gray-700'
      };
    }
    
    // 将 chainId 转换为数字进行比较
    const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
    
    switch (numericChainId) {
      case foundry.id:
        return {
          name: 'Foundry',
          color: 'bg-green-500',
          textColor: 'text-green-700'
        };
      default:
        return {
          name: `Chain ID: ${chainId}`,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700'
        };
    }
  };

  const networkInfo = getNetworkInfo(chainId);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${networkInfo.color}`}></div>
      <span className={`text-xs font-medium ${networkInfo.textColor}`}>
        {networkInfo.name}
      </span>
    </div>
  );
} 