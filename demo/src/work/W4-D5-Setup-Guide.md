# Delegate 合约完整设置指南

## 🎯 项目概述

本项目实现了一个完整的 Delegate 合约客户端，支持：

- ✅ **批量执行** - 在单个交易中执行多个操作
- ✅ **代理调用** - 使用 delegatecall 执行其他合约代码  
- ✅ **授权存款** - 与 TokenBank 的一键授权和存款操作
- ✅ **权限管理** - 支持多级权限控制系统
- ✅ **紧急功能** - 提供紧急暂停和资金提取功能
- ✅ **完整测试** - 覆盖所有 ABI 方法的测试套件

## 📁 文件结构

```
demo/src/work/
├── W4-D5-Delegdate.ts           # 主要的 DelegateClient 类实现
├── W4-D5-Delegate-Tests.ts      # 完整的测试套件
├── W4-D5-Delegate-Demo.ts       # 用户友好的演示页面
├── W4-D5-Delegate-README.md     # 详细使用文档
├── W4-D5-Setup-Guide.md         # 设置指南（本文件）
└── run-delegate-demo.js         # 便捷运行脚本
```

## 🚀 快速开始

### 1. 环境准备

确保你已经安装了以下依赖：

```bash
# 核心依赖
npm install viem typescript ts-node

# 开发依赖
npm install @types/node --save-dev
```

### 2. 环境变量配置

在项目根目录创建 `.env` 文件：

```bash
# 私钥配置
PRIVATE_KEY=0x你的私钥

# Sepolia 测试网节点
QUICKNODE_ENDPOINT=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# 或者使用其他提供商
# QUICKNODE_ENDPOINT=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### 3. 合约地址配置

修改 `W4-D5-Delegdate.ts` 中的合约地址：

```typescript
const CONTRACT_ADDRESSES = {
  DELEGATE: "0x你的Delegate合约地址",      // 替换为实际部署的地址
  TOKEN_BANK: "0x你的TokenBank合约地址",   // 替换为实际部署的地址
  TOKEN: "0x你的代币合约地址",             // 替换为实际代币地址
};
```

### 4. Package.json 脚本配置

在你的 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "delegate:demo": "node demo/src/work/run-delegate-demo.js --demo",
    "delegate:test": "node demo/src/work/run-delegate-demo.js --test",
    "delegate:test:query": "node demo/src/work/run-delegate-demo.js --test=query",
    "delegate:test:permission": "node demo/src/work/run-delegate-demo.js --test=permission",
    "delegate:test:deposit": "node demo/src/work/run-delegate-demo.js --test=deposit",
    "delegate:test:multicall": "node demo/src/work/run-delegate-demo.js --test=multicall",
    "delegate:test:delegate": "node demo/src/work/run-delegate-demo.js --test=delegate",
    "delegate:test:emergency": "node demo/src/work/run-delegate-demo.js --test=emergency",
    "delegate:test:integrated": "node demo/src/work/run-delegate-demo.js --test=integrated",
    "delegate:client": "node demo/src/work/run-delegate-demo.js --client",
    "delegate:help": "node demo/src/work/run-delegate-demo.js --help"
  }
}
```

## 🎮 使用方法

### 方法一：使用 npm 脚本（推荐）

```bash
# 运行完整演示页面
npm run delegate:demo

# 运行完整测试套件
npm run delegate:test

# 运行特定测试模块
npm run delegate:test:query
npm run delegate:test:multicall
npm run delegate:test:deposit

# 运行基础客户端
npm run delegate:client

# 查看帮助
npm run delegate:help
```

### 方法二：直接使用运行脚本

```bash
# 运行演示
node demo/src/work/run-delegate-demo.js --demo

# 运行测试
node demo/src/work/run-delegate-demo.js --test

# 运行特定测试
node demo/src/work/run-delegate-demo.js --test=multicall
```

### 方法三：直接使用 TypeScript

```bash
# 运行演示页面
npx ts-node demo/src/work/W4-D5-Delegate-Demo.ts

# 运行完整测试
npx ts-node demo/src/work/W4-D5-Delegate-Tests.ts

# 运行特定测试
npx ts-node demo/src/work/W4-D5-Delegate-Tests.ts --test=query
```

## 🧪 测试模块说明

### 1. 查询功能测试 (`query`)
- 测试合约基本信息查询
- 验证余额和授权状态查询
- 检查权限和状态查询

```bash
npm run delegate:test:query
```

### 2. 权限管理测试 (`permission`)
- 测试授权调用者的添加和移除
- 验证权限检查功能
- 测试所有者权限验证

```bash
npm run delegate:test:permission
```

### 3. 授权和存款测试 (`deposit`)
- 测试单个代币的授权和存款
- 测试批量代币的授权和存款
- 验证与 TokenBank 的集成

```bash
npm run delegate:test:deposit
```

### 4. 批量调用测试 (`multicall`)
- 测试普通批量调用
- 测试批量代理调用
- 测试带价值的批量调用

```bash
npm run delegate:test:multicall
```

### 5. 代理调用测试 (`delegate`)
- 测试单个代理调用功能
- 验证 delegatecall 的正确性
- 测试安全性和权限控制

```bash
npm run delegate:test:delegate
```

### 6. 紧急功能测试 (`emergency`)
- 测试紧急暂停功能
- 测试紧急提取功能
- 验证所有者权限要求

```bash
npm run delegate:test:emergency
```

### 7. 综合功能测试 (`integrated`)
- 测试多功能组合使用
- 验证复杂场景下的表现
- 测试状态一致性

```bash
npm run delegate:test:integrated
```

## 📊 代码结构说明

### DelegateClient 类

主要的客户端类，提供所有 Delegate 合约功能的封装：

```typescript
import { DelegateClient } from './W4-D5-Delegdate';

const client = new DelegateClient();

// 基础查询
await client.getOwner();
await client.isPaused();
await client.getETHBalance();

// 授权和存款
await client.approveAndDeposit(token, bank, amount);
await client.batchApproveAndDeposit(tokens, banks, amounts);

// 批量调用
await client.multicall(calls);
await client.multicallDelegate(calls);
await client.multicallWithValue(callsWithValue);

// 权限管理
await client.addAuthorizedCaller(caller);
await client.isAuthorizedCaller(caller);

// 紧急功能
await client.setPaused(true);
await client.emergencyWithdraw(token, to, amount);
```

### 测试套件

完整的测试套件，覆盖所有功能：

```typescript
import { runDelegateTests, runSpecificTest } from './W4-D5-Delegate-Tests';

// 运行全部测试
await runDelegateTests();

// 运行特定测试
await runSpecificTest('multicall');
```

### 演示页面

用户友好的交互界面：

```typescript
import { DelegateDemoPage } from './W4-D5-Delegate-Demo';

const demo = new DelegateDemoPage();
await demo.runDemo();
```

## 🔧 高级配置

### 自定义网络配置

如果需要使用其他网络，修改客户端配置：

```typescript
// 在 private-client.ts 和相关文件中修改网络配置
import { mainnet, goerli, sepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: sepolia, // 修改为目标网络
  transport: http(process.env.RPC_ENDPOINT),
});
```

### 自定义合约 ABI

如果你的合约有额外的功能，可以：

1. 更新 ABI 文件
2. 在 DelegateClient 中添加新方法
3. 在测试套件中添加相应测试

### 错误处理自定义

所有方法都包含错误处理，你可以根据需要自定义：

```typescript
try {
  await client.approveAndDeposit(token, bank, amount);
} catch (error) {
  // 自定义错误处理
  console.error("操作失败:", error.message);
  // 可以添加重试逻辑、用户通知等
}
```

## 🛡️ 安全最佳实践

### 1. 私钥安全
- 永远不要在代码中硬编码私钥
- 使用环境变量存储敏感信息
- 在生产环境中使用硬件钱包或安全存储

### 2. 合约验证
- 在使用前验证合约地址
- 确认合约已经过审计
- 检查合约的权限设置

### 3. 测试验证
- 始终在测试网络中进行充分测试
- 验证所有功能的正确性
- 测试边界条件和错误场景

### 4. 权限管理
- 谨慎管理合约权限
- 定期审查授权调用者
- 及时移除不需要的权限

## 🐛 常见问题

### Q1: 交易失败怎么办？

**A:** 检查以下几点：
- 账户余额是否足够（ETH 和代币）
- 合约地址是否正确
- 是否有必要的权限
- 合约是否处于暂停状态

### Q2: 如何调试问题？

**A:** 使用以下方法：
- 查看控制台日志输出
- 使用区块链浏览器查看交易详情
- 运行单独的测试模块定位问题
- 检查网络连接和节点状态

### Q3: 如何修改合约地址？

**A:** 在以下文件中更新地址：
- `W4-D5-Delegdate.ts` - CONTRACT_ADDRESSES 配置
- `W4-D5-Delegate-Tests.ts` - TEST_CONFIG 配置

### Q4: 如何添加新功能？

**A:** 按以下步骤：
1. 在 DelegateClient 类中添加新方法
2. 在测试套件中添加相应测试
3. 更新演示页面（如需要）
4. 更新文档

## 📚 相关文档

- [详细使用文档](./W4-D5-Delegate-README.md)
- [Viem 官方文档](https://viem.sh/)
- [Solidity 文档](https://docs.soliditylang.org/)
- [以太坊开发文档](https://ethereum.org/developers/)

## 🤝 贡献指南

欢迎贡献代码和改进建议：

1. 遵循现有的代码风格
2. 添加适当的注释和文档
3. 为新功能编写测试
4. 确保所有测试通过

## 📞 支持

如有问题或建议，请：

1. 查看现有文档
2. 运行测试诊断问题
3. 检查 GitHub Issues
4. 联系项目维护者

---

**祝你使用愉快！🎉**