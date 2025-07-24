'use client';

import { useState } from 'react';
import { createPublicClient, http, parseAbiItem, type Address } from 'viem';
import { foundry } from 'wagmi/chains';
import { formatEther } from 'viem';

// 合约地址 - 请根据实际部署的地址进行修改
const NFT_MARKET_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address;

// 创建公共客户端
const publicClient = createPublicClient({
  chain: foundry,
  transport: http()
});

interface HistoricalEvent {
  type: 'NFTListed' | 'NFTSold';
  seller: Address;
  buyer?: Address;
  tokenId: bigint;
  price: bigint;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
}

export default function HistoricalEvents() {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fromBlock, setFromBlock] = useState('');
  const [toBlock, setToBlock] = useState('');

  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  // 查询历史事件
  const fetchHistoricalEvents = async () => {
    if (!fromBlock || !toBlock) {
      alert('请输入起始和结束区块号');
      return;
    }

    setIsLoading(true);
    try {
      const fromBlockNum = BigInt(fromBlock);
      const toBlockNum = BigInt(toBlock);

      // 查询 NFTListed 事件
      const nftListedEvent = parseAbiItem('event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price)');
      const listedLogs = await publicClient.getLogs({
        address: NFT_MARKET_ADDRESS,
        event: nftListedEvent,
        fromBlock: fromBlockNum,
        toBlock: toBlockNum,
      });

      // 查询 NFTSold 事件
      const nftSoldEvent = parseAbiItem('event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price)');
      const soldLogs = await publicClient.getLogs({
        address: NFT_MARKET_ADDRESS,
        event: nftSoldEvent,
        fromBlock: fromBlockNum,
        toBlock: toBlockNum,
      });

      // 处理事件数据
      const allEvents: HistoricalEvent[] = [];

      // 处理上架事件
      for (const log of listedLogs) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        allEvents.push({
          type: 'NFTListed',
          seller: log.args.seller!,
          tokenId: log.args.tokenId!,
          price: log.args.price!,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash,
          timestamp: Number(block.timestamp)
        });
      }

      // 处理售出事件
      for (const log of soldLogs) {
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });
        allEvents.push({
          type: 'NFTSold',
          seller: log.args.seller!,
          buyer: log.args.buyer!,
          tokenId: log.args.tokenId!,
          price: log.args.price!,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash,
          timestamp: Number(block.timestamp)
        });
      }

      // 按时间排序
      allEvents.sort((a, b) => b.timestamp - a.timestamp);

      setEvents(allEvents);
      console.log(`查询到 ${allEvents.length} 个历史事件`);
    } catch (error) {
      console.error('查询历史事件失败:', error);
      alert('查询失败，请检查区块号是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取事件图标
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'NFTListed':
        return '🎯';
      case 'NFTSold':
        return '💰';
      default:
        return '📝';
    }
  };

  // 获取事件颜色
  const getEventColor = (type: string) => {
    switch (type) {
      case 'NFTListed':
        return 'border-blue-500 bg-blue-50';
      case 'NFTSold':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">历史事件查询</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              起始区块
            </label>
            <input
              type="number"
              value={fromBlock}
              onChange={(e) => setFromBlock(e.target.value)}
              placeholder="例如: 1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束区块
            </label>
            <input
              type="number"
              value={toBlock}
              onChange={(e) => setToBlock(e.target.value)}
              placeholder="例如: 2000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={fetchHistoricalEvents}
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? '查询中...' : '查询历史事件'}
        </button>

        {events.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">
              查询结果: {events.length} 个事件
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={`${event.transactionHash}-${index}`}
                  className={`border-l-4 p-4 rounded-r-lg ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getEventIcon(event.type)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {event.type === 'NFTListed' ? 'NFT上架' : 'NFT售出'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Token ID: {event.tokenId.toString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatEther(event.price)} ETH
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(event.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">卖家:</span> {formatAddress(event.seller)}
                    </div>
                    {event.buyer && (
                      <div>
                        <span className="font-medium">买家:</span> {formatAddress(event.buyer)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">交易哈希:</span>
                      <span className="font-mono text-xs ml-1">
                        {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">区块:</span> {event.blockNumber.toString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 