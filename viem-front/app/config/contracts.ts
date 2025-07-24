import { type Address } from 'viem';

// 合约地址配置
// 请根据实际部署的地址进行修改
export const CONTRACT_ADDRESSES = {
  // NFTMarket 合约地址 - 请替换为实际部署的地址
  NFT_MARKET: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
  
  // ERC20 代币合约地址
  ERC20_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
  
  // ERC721 NFT 合约地址
  ERC721_NFT: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
  
  // TokenBank 合约地址
  TOKEN_BANK: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
} as const;

// 网络配置
export const NETWORK_CONFIG = {
  chainId: 31337, // Foundry 默认链ID
  name: 'Foundry',
  rpcUrl: 'http://localhost:8545',
} as const;

// 事件配置
export const EVENT_CONFIG = {
  // 监听的事件类型
  events: ['NFTListed', 'NFTSold'] as const,
  
  // 最大事件数量
  maxEvents: 100,
  
  // 自动重连间隔（毫秒）
  reconnectInterval: 5000,
} as const;

// 导出类型
export type ContractAddresses = typeof CONTRACT_ADDRESSES;
export type NetworkConfig = typeof NETWORK_CONFIG;
export type EventConfig = typeof EVENT_CONFIG; 