'use client';

import { useState } from 'react';
import EventControl from '../NFTMarket/components/EventControl';
import EventLog from '../NFTMarket/components/EventLog';
import HistoricalEvents from '../NFTMarket/components/HistoricalEvents';


export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'historical'>('realtime');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NFT Market 事件监控</h1>
          <p className="mt-2 text-gray-600">
            实时监控和查询 NFTMarket 合约的上架和交易事件
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('realtime')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'realtime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              实时监控
            </button>
            <button
              onClick={() => setActiveTab('historical')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'historical'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              历史查询
            </button>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'realtime' ? (
            <>
              {/* 实时监控 - 控制面板 */}
              <div className="lg:col-span-1">
                <EventControl />
              </div>
              
              {/* 实时监控 - 事件日志 */}
              <div className="lg:col-span-2">
                <EventLog maxEvents={100} />
              </div>
            </>
          ) : (
            /* 历史查询 */
            <div className="lg:col-span-3">
              <HistoricalEvents />
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">实时监控</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 点击"开始监听"启动事件监听</li>
                <li>• 实时显示NFT上架和交易事件</li>
                <li>• 支持自动重连和错误处理</li>
                <li>• 可随时停止监听</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">历史查询</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 输入区块范围查询历史事件</li>
                <li>• 支持查询NFTListed和NFTSold事件</li>
                <li>• 按时间倒序排列显示结果</li>
                <li>• 显示完整的交易信息</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 合约信息 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">合约信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">NFTMarket 合约地址:</span>
              <span className="font-mono text-gray-900 ml-2">
                0x5FbDB2315678afecb367f032d93F642f64180aa3
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">网络:</span>
              <span className="text-gray-900 ml-2">Foundry (Local)</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">监听事件:</span>
              <span className="text-gray-900 ml-2">NFTListed, NFTSold</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">状态:</span>
              <span className="text-green-600 ml-2">已连接</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 