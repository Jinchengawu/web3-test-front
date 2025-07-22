'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Web3 NFT Market</h1>
      <p className="text-xl mb-8">使用 AppKit 和 WalletConnect 的 NFT 市场</p>
      
      <div className="space-y-4">
        <Link 
          href="/NFTMarket" 
          className="block bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-center"
        >
          进入 NFT 市场
        </Link>
        
        <Link 
          href="/tokenbank" 
          className="block bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 text-center"
        >
          TokenBank 管理
        </Link>
      </div>
      
      <div className="mt-12 text-center text-gray-600">
        <p>功能特性：</p>
        <ul className="mt-2 space-y-1">
          <li>• 使用 AppKit 进行钱包连接</li>
          <li>• 支持 WalletConnect 移动端钱包</li>
          <li>• NFT 上架和购买功能</li>
          <li>• 代币存款和取款</li>
          <li>• 多账户切换支持</li>
        </ul>
      </div>
    </div>
  );
}
