'use client';

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import { nftMarketEventListener, type NFTEvent } from '../../services/eventListener';

interface EventLogProps {
  maxEvents?: number;
}

export default function EventLog({ maxEvents = 50 }: EventLogProps) {
  const [events, setEvents] = useState<NFTEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // 事件处理函数
    const handleEvent = (event: NFTEvent) => {
      setEvents(prevEvents => {
        const newEvents = [event, ...prevEvents];
        // 限制事件数量
        return newEvents.slice(0, maxEvents);
      });
    };

    // 添加事件监听器
    nftMarketEventListener.addListener(handleEvent);
    
    // 更新监听状态
    setIsListening(nftMarketEventListener.getListeningStatus());

    // 清理函数
    return () => {
      nftMarketEventListener.removeListener(handleEvent);
    };
  }, [maxEvents]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 格式化价格
  const formatPrice = (price: bigint) => {
    return formatEther(price);
  };

  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  // 清空事件日志
  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">实时事件日志</h3>
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${isListening ? 'text-green-600' : 'text-red-600'}`}>
            {isListening ? '监听中' : '未监听'}
          </span>
        </div>
        <button
          onClick={clearEvents}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          清空日志
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📡</div>
            <p>等待事件...</p>
            <p className="text-sm">当有NFT上架或交易时，事件将在这里显示</p>
          </div>
        ) : (
          events.map((event, index) => (
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
                    {formatPrice(event.price)} ETH
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
          ))
        )}
      </div>

      {events.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          显示最近 {events.length} 个事件
        </div>
      )}
    </div>
  );
} 