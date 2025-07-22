'use client';

import { useState } from 'react';
import { useAppKitAccount, useAppKitNetwork, useDisconnect } from '@reown/appkit/react';
import { foundry } from 'wagmi/chains';

interface UserProfileProps {
  onDisconnect: () => void;
}

export default function UserProfile({ onDisconnect }: UserProfileProps) {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onDisconnect();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('断开连接错误:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case foundry.id:
        return 'Foundry';
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="relative">
      {/* 用户头像按钮 */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200"
      >
        {/* 用户头像 */}
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {address.slice(2, 4).toUpperCase()}
          </span>
        </div>
        
        {/* 用户信息 */}
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {formatAddress(address)}
          </div>
          <div className="text-xs text-gray-500">
            {getNetworkName(chainId)}
          </div>
        </div>
        
        {/* 下拉箭头 */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            {/* 用户详细信息 */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(address)}
                  </div>
                  <div className="text-xs text-gray-500">
                    已连接
                  </div>
                </div>
              </div>
            </div>

            {/* 网络信息 */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="text-xs text-gray-500 mb-1">当前网络</div>
              <div className="text-sm font-medium text-gray-900">
                {getNetworkName(chainId)}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>断开连接</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
} 