import { createPublicClient, http, parseAbiItem, type Address } from 'viem';
import { foundry } from 'wagmi/chains';
import { CONTRACT_ADDRESSES } from '../config/contracts';

// 使用配置文件中的合约地址
const NFT_MARKET_ADDRESS = CONTRACT_ADDRESSES.NFT_MARKET;

// 创建公共客户端
const publicClient = createPublicClient({
  chain: foundry,
  transport: http()
});

// 定义事件类型
export interface NFTEvent {
  type: 'NFTListed' | 'NFTSold';
  seller: Address;
  buyer?: Address;
  tokenId: bigint;
  price: bigint;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
}

// 事件监听器类
export class NFTMarketEventListener {
  private isListening = false;
  private listeners: ((event: NFTEvent) => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  // 添加事件监听器
  addListener(callback: (event: NFTEvent) => void) {
    this.listeners.push(callback);
  }

  // 移除事件监听器
  removeListener(callback: (event: NFTEvent) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 开始监听事件
  async startListening() {
    if (this.isListening) {
      console.log('Event listener is already running');
      return;
    }

    console.log('Starting NFT Market event listener...');
    this.isListening = true;

    try {
      // 使用轮询方式监听事件
      const pollInterval = setInterval(async () => {
        try {
          // 获取最新区块号
          const latestBlock = await publicClient.getBlockNumber();
          const fromBlock = latestBlock - BigInt(10); // 监听最近10个区块

          // 查询 NFTListed 事件
          const nftListedEvent = parseAbiItem('event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price)');
          const listedLogs = await publicClient.getLogs({
            address: NFT_MARKET_ADDRESS,
            event: nftListedEvent,
            fromBlock,
            toBlock: latestBlock,
          });

          // 查询 NFTSold 事件
          const nftSoldEvent = parseAbiItem('event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price)');
          const soldLogs = await publicClient.getLogs({
            address: NFT_MARKET_ADDRESS,
            event: nftSoldEvent,
            fromBlock,
            toBlock: latestBlock,
          });

          // 处理上架事件
          for (const log of listedLogs) {
            const event: NFTEvent = {
              type: 'NFTListed',
              seller: log.args.seller!,
              tokenId: log.args.tokenId!,
              price: log.args.price!,
              blockNumber: log.blockNumber!,
              transactionHash: log.transactionHash,
              timestamp: Date.now()
            };
            
            console.log('🎯 NFT Listed Event:', {
              seller: event.seller,
              tokenId: event.tokenId.toString(),
              price: event.price.toString(),
              txHash: event.transactionHash
            });
            
            this.notifyListeners(event);
          }

          // 处理售出事件
          for (const log of soldLogs) {
            const event: NFTEvent = {
              type: 'NFTSold',
              seller: log.args.seller!,
              buyer: log.args.buyer!,
              tokenId: log.args.tokenId!,
              price: log.args.price!,
              blockNumber: log.blockNumber!,
              transactionHash: log.transactionHash,
              timestamp: Date.now()
            };
            
            console.log('💰 NFT Sold Event:', {
              seller: event.seller,
              buyer: event.buyer,
              tokenId: event.tokenId.toString(),
              price: event.price.toString(),
              txHash: event.transactionHash
            });
            
            this.notifyListeners(event);
          }
        } catch (error) {
          console.error('Error polling events:', error);
        }
      }, 5000); // 每5秒轮询一次

      // 保存取消订阅函数
      this.unsubscribe = () => {
        clearInterval(pollInterval);
      };

      console.log('✅ NFT Market event listener started successfully');
    } catch (error) {
      console.error('Failed to start event listener:', error);
      this.isListening = false;
    }
  }

  // 停止监听事件
  stopListening() {
    if (!this.isListening) {
      console.log('Event listener is not running');
      return;
    }

    console.log('Stopping NFT Market event listener...');
    
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    this.isListening = false;
    console.log('✅ NFT Market event listener stopped');
  }

  // 通知所有监听器
  private notifyListeners(event: NFTEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener callback:', error);
      }
    });
  }

  // 获取监听状态
  getListeningStatus() {
    return this.isListening;
  }
}

// 创建全局事件监听器实例
export const nftMarketEventListener = new NFTMarketEventListener();

// 自动启动监听器（在客户端环境中）
if (typeof window !== 'undefined') {
  // 在客户端环境中自动启动监听器
  nftMarketEventListener.startListening().catch(console.error);
} 