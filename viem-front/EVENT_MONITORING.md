# NFT Market 事件监控功能

## 功能概述

本项目实现了完整的 NFTMarket 合约事件监控功能，包括：

- **实时事件监听**: 监听 NFT 上架和交易事件
- **历史事件查询**: 查询指定区块范围内的历史事件
- **前端实时展示**: 在网页上实时显示事件信息
- **事件控制面板**: 手动控制监听器的启动和停止

## 功能特性

### 1. 实时事件监听
- 监听 `NFTListed` 事件（NFT上架）
- 监听 `NFTSold` 事件（NFT售出）
- 自动重连和错误处理
- 轮询机制确保事件不遗漏

### 2. 事件信息展示
- 事件类型（上架/售出）
- 卖家地址
- 买家地址（仅售出事件）
- Token ID
- 价格（ETH）
- 交易哈希
- 区块号
- 时间戳

### 3. 历史事件查询
- 按区块范围查询历史事件
- 支持查询 NFTListed 和 NFTSold 事件
- 按时间倒序排列显示结果

## 文件结构

```
viem-front/
├── app/
│   ├── services/
│   │   └── eventListener.ts          # 事件监听服务
│   ├── config/
│   │   └── contracts.ts              # 合约配置
│   ├── NFTMarket/
│   │   └── components/
│   │       ├── EventLog.tsx          # 事件日志组件
│   │       ├── EventControl.tsx      # 事件控制组件
│   │       └── HistoricalEvents.tsx  # 历史事件组件
│   └── events/
│       └── page.tsx                  # 事件监控页面
└── EVENT_MONITORING.md               # 本文档
```

## 使用方法

### 1. 访问事件监控页面
在浏览器中访问 `/events` 页面，或者从主页点击"事件监控"按钮。

### 2. 实时监控
1. 在"实时监控"标签页中，点击"开始监听"按钮
2. 监听器将开始轮询区块链事件
3. 当有 NFT 上架或交易时，事件将实时显示在日志中
4. 可以随时点击"停止监听"按钮停止监听

### 3. 历史查询
1. 切换到"历史查询"标签页
2. 输入起始和结束区块号
3. 点击"查询历史事件"按钮
4. 查询结果将显示在下方

## 配置说明

### 合约地址配置
在 `app/config/contracts.ts` 文件中配置合约地址：

```typescript
export const CONTRACT_ADDRESSES = {
  NFT_MARKET: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
  // ... 其他合约地址
};
```

**重要**: 请将 `NFT_MARKET` 地址替换为您实际部署的合约地址。

### 网络配置
当前配置为 Foundry 本地网络：

```typescript
export const NETWORK_CONFIG = {
  chainId: 31337, // Foundry 默认链ID
  name: 'Foundry',
  rpcUrl: 'http://localhost:8545',
};
```

## 技术实现

### 1. 事件监听机制
使用轮询方式监听事件，每5秒查询一次最新区块：

```typescript
const pollInterval = setInterval(async () => {
  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock - BigInt(10);
  
  // 查询事件...
}, 5000);
```

### 2. 事件解析
使用 viem 的 `parseAbiItem` 和 `getLogs` 方法解析事件：

```typescript
const nftListedEvent = parseAbiItem('event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price)');
const logs = await publicClient.getLogs({
  address: NFT_MARKET_ADDRESS,
  event: nftListedEvent,
  fromBlock,
  toBlock: latestBlock,
});
```

### 3. 前端状态管理
使用 React hooks 管理事件状态：

```typescript
const [events, setEvents] = useState<NFTEvent[]>([]);
const [isListening, setIsListening] = useState(false);
```

## 事件类型

### NFTListed 事件
```solidity
event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price);
```

### NFTSold 事件
```solidity
event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
```

## 故障排除

### 1. 监听器无法启动
- 检查合约地址是否正确
- 确认网络连接正常
- 查看浏览器控制台错误信息

### 2. 没有事件显示
- 确认合约已部署并包含相应事件
- 检查区块范围是否正确
- 确认有实际的 NFT 上架或交易操作

### 3. 事件延迟
- 轮询间隔为5秒，可能存在延迟
- 可以调整轮询间隔（在 eventListener.ts 中修改）

## 扩展功能

### 1. 添加更多事件类型
在 `eventListener.ts` 中添加新的事件监听：

```typescript
const newEvent = parseAbiItem('event NewEvent(...)');
const newLogs = await publicClient.getLogs({
  address: NFT_MARKET_ADDRESS,
  event: newEvent,
  fromBlock,
  toBlock: latestBlock,
});
```

### 2. 添加事件过滤
可以添加按地址、价格范围等条件过滤事件：

```typescript
// 按卖家地址过滤
const filteredEvents = events.filter(event => 
  event.seller.toLowerCase() === targetAddress.toLowerCase()
);
```

### 3. 添加事件通知
可以集成 WebSocket 或推送通知功能，实现实时通知。

## 注意事项

1. **合约地址**: 确保使用正确的合约地址
2. **网络连接**: 确保与区块链网络的连接稳定
3. **性能考虑**: 轮询间隔不宜过短，避免对网络造成压力
4. **错误处理**: 监听器包含错误处理机制，但建议监控日志
5. **数据持久化**: 当前事件数据仅保存在内存中，页面刷新后会丢失

## 更新日志

- **v1.0.0**: 初始版本，实现基本的实时监听和历史查询功能
- 支持 NFTListed 和 NFTSold 事件监听
- 提供实时事件展示和历史事件查询
- 包含事件控制面板和状态指示 