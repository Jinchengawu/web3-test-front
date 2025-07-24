'use client';

import { useState, useEffect } from 'react';
import { nftMarketEventListener } from '../../services/eventListener';

export default function EventControl() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 更新监听状态
    const updateStatus = () => {
      setIsListening(nftMarketEventListener.getListeningStatus());
    };

    // 初始状态
    updateStatus();

    // 定期检查状态
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartListening = async () => {
    setIsLoading(true);
    try {
      await nftMarketEventListener.startListening();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start listening:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopListening = () => {
    setIsLoading(true);
    try {
      nftMarketEventListener.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop listening:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">事件监听控制</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            状态: {isListening ? '正在监听' : '未监听'}
          </span>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleStartListening}
            disabled={isListening || isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isListening || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLoading ? '启动中...' : '开始监听'}
          </button>

          <button
            onClick={handleStopListening}
            disabled={!isListening || isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isListening || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isLoading ? '停止中...' : '停止监听'}
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• 监听NFTMarket合约的NFTListed和NFTSold事件</p>
          <p>• 事件将实时显示在下方日志中</p>
          <p>• 支持自动重连和错误处理</p>
        </div>
      </div>
    </div>
  );
} 