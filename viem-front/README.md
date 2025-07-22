# NFTMarket with AppKit

这是一个使用 AppKit 和 WalletConnect 构建的 NFT 市场前端项目。

## 功能特性

- 🔗 **AppKit 钱包连接**: 使用 AppKit 进行钱包连接，支持 WalletConnect 移动端钱包
- 🖼️ **NFT 市场**: 完整的 NFT 上架、购买、下架功能
- 💰 **代币管理**: ERC20 代币的授权、存款、取款操作
- 🔄 **多账户支持**: 支持切换不同账户进行操作
- 📱 **移动端友好**: 支持手机端钱包连接

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **钱包连接**: AppKit + WalletConnect
- **区块链交互**: Wagmi + Viem
- **样式**: Tailwind CSS
- **类型安全**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 配置环境

在 `app/providers.tsx` 文件中，将 `YOUR_PROJECT_ID` 替换为你的 WalletConnect Project ID：

```typescript
const wagmiAdapter = new WagmiAdapter({
  networks: [foundry],
  projectId: 'YOUR_PROJECT_ID', // 替换为你的 Project ID
  ssr: true
});
```

### 3. 部署智能合约

确保以下合约已部署到本地或测试网络：

- **ERC20 Token**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **ERC721 NFT**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **NFT Market**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Token Bank**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

### 4. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

### 1. 连接钱包

1. 点击首页的"进入 NFT 市场"按钮
2. 在 NFT 市场页面，点击 `<appkit-button>` 连接钱包
3. 选择你的钱包（支持 MetaMask、WalletConnect 等）

### 2. 代币操作

- **授权**: 授权 TokenBank 合约使用你的 ERC20 代币
- **存款**: 将代币存入 TokenBank
- **取款**: 从 TokenBank 取出代币

### 3. NFT 操作

- **查看我的 NFT**: 显示你拥有的所有 NFT
- **上架 NFT**: 选择 NFT 并设置价格进行上架
- **购买 NFT**: 在市场中选择 NFT 进行购买
- **下架 NFT**: 下架你已上架的 NFT

### 4. 多账户测试

1. 连接第一个钱包账户
2. 上架一些 NFT
3. 断开连接
4. 连接另一个钱包账户
5. 使用代币购买第一个账户上架的 NFT

## 项目结构

```
viem-front/
├── app/
│   ├── NFTMarket/          # NFT 市场页面
│   ├── tokenbank/          # TokenBank 管理页面
│   ├── contracts/          # 智能合约 ABI
│   ├── abi/               # 其他 ABI 文件
│   ├── providers.tsx      # AppKit 和 Wagmi 配置
│   └── page.tsx           # 首页
├── types/
│   └── global.d.ts        # 全局类型声明
└── package.json
```

## 智能合约

项目包含以下智能合约的 ABI：

- `ERC20.json`: ERC20 代币合约
- `TokenBank.json`: 代币银行合约
- `NFTMarket.json`: NFT 市场合约
- `ERC721_MARKET_ABI.json`: ERC721 NFT 合约

## 注意事项

1. **网络配置**: 当前配置为 Foundry 本地网络，生产环境需要修改为相应的网络
2. **合约地址**: 请根据实际部署的合约地址修改代码中的地址常量
3. **Project ID**: 需要在 WalletConnect Cloud 注册获取 Project ID
4. **移动端测试**: 建议在手机端安装 WalletConnect 兼容的钱包进行测试

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 确保已安装兼容的钱包
   - 检查网络配置是否正确
   - 确认 Project ID 配置正确

2. **合约调用失败**
   - 检查合约地址是否正确
   - 确认合约已正确部署
   - 检查账户余额是否充足

3. **NFT 上架失败**
   - 确保已授权 NFT 给市场合约
   - 检查 NFT 所有权
   - 确认价格设置合理

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License



