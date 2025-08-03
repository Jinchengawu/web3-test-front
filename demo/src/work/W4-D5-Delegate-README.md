# Delegate 合约客户端实现

## 项目简介

这是一个完整的 Delegate 合约客户端实现，支持批量执行、代理调用、与 TokenBank 的授权和存款操作，以及紧急停止功能。

## 功能特性

### 1. 授权和存款操作
- ✅ 单个代币授权并存款 (`approveAndDeposit`)
- ✅ 批量代币授权并存款 (`batchApproveAndDeposit`)

### 2. 批量调用功能
- ✅ 普通批量调用 (`multicall`)
- ✅ 批量代理调用 (`multicallDelegate`) 
- ✅ 带价值的批量调用 (`multicallWithValue`)

### 3. 代理调用
- ✅ 单个代理调用 (`delegateCall`)

### 4. 权限管理
- ✅ 添加授权调用者 (`addAuthorizedCaller`)
- ✅ 移除授权调用者 (`removeAuthorizedCaller`)
- ✅ 检查授权状态 (`authorizedCallers`)

### 5. 紧急停止和提取
- ✅ 设置暂停状态 (`setPaused`)
- ✅ 紧急提取代币 (`emergencyWithdraw`)
- ✅ 紧急提取 ETH (`emergencyWithdrawETH`)

### 6. 查询功能
- ✅ 查询代币余额 (`getTokenBalance`)
- ✅ 查询 ETH 余额 (`getETHBalance`)
- ✅ 查询授权额度 (`getAllowance`)
- ✅ 查询合约所有者 (`owner`)
- ✅ 查询暂停状态 (`paused`)

## 文件结构

```
demo/src/work/
├── W4-D5-Delegdate.ts          # 主要的 DelegateClient 类实现
├── W4-D5-Delegate-Tests.ts     # 完整的测试套件
├── W4-D5-Delegate-Demo.ts      # 演示页面实现
└── W4-D5-Delegate-README.md    # 使用说明（本文件）
```

## 快速开始

### 1. 配置合约地址

在使用之前，请在 `W4-D5-Delegdate.ts` 中修改合约地址配置：

```typescript
const CONTRACT_ADDRESSES = {
  DELEGATE: "0x你的Delegate合约地址",      // 替换为实际的 Delegate 合约地址
  TOKEN_BANK: "0x你的TokenBank合约地址",   // 替换为实际的 TokenBank 合约地址
  TOKEN: "0x你的代币合约地址",             // 替换为实际的代币合约地址
};
```

### 2. 配置环境变量

确保在 `.env` 文件中设置：

```bash
PRIVATE_KEY=你的私钥
QUICKNODE_ENDPOINT=你的Sepolia节点URL
```

### 3. 运行基本测试

```typescript
import { DelegateClient } from './W4-D5-Delegdate';

const client = new DelegateClient();

// 查询合约状态
await client.getOwner();
await client.isPaused();
await client.getETHBalance();

// 授权并存款
await client.approveAndDeposit(
  tokenAddress,
  tokenBankAddress, 
  amount
);
```

### 4. 运行完整测试套件

```typescript
import { runDelegateTests } from './W4-D5-Delegate-Tests';

// 运行所有测试
await runDelegateTests();
```

## 详细使用指南

### 基本用法

```typescript
import { DelegateClient } from './W4-D5-Delegdate';
import { parseUnits, Address } from 'viem';

// 初始化客户端
const delegateClient = new DelegateClient();

// 获取当前账户
const account = delegateClient.getCurrentAccount();
console.log("当前账户:", account);
```

### 授权和存款操作

```typescript
// 单个代币授权并存款
await delegateClient.approveAndDeposit(
  "0x代币地址" as Address,
  "0xTokenBank地址" as Address,
  parseUnits("100", 18) // 100 个代币
);

// 批量代币授权并存款
await delegateClient.batchApproveAndDeposit(
  ["0x代币1地址", "0x代币2地址"] as Address[],
  ["0xTokenBank1地址", "0xTokenBank2地址"] as Address[],
  [parseUnits("100", 18), parseUnits("200", 18)]
);
```

### 批量调用操作

```typescript
// 构建调用数据
const callData = delegateClient.buildCallData(
  TokenBankABI,
  "totalDeposits", 
  []
);

// 普通批量调用
const calls = [
  {
    target: "0xTokenBank地址" as Address,
    callData: callData
  }
];

await delegateClient.multicall(calls);

// 批量代理调用
await delegateClient.multicallDelegate(calls);

// 带价值的批量调用
const callsWithValue = [
  {
    target: "0x目标地址" as Address,
    value: parseEther("0.1"), // 0.1 ETH
    callData: callData
  }
];

await delegateClient.multicallWithValue(callsWithValue);
```

### 权限管理

```typescript
// 检查授权状态
const isAuthorized = await delegateClient.isAuthorizedCaller(
  "0x用户地址" as Address
);

// 添加授权调用者（需要所有者权限）
await delegateClient.addAuthorizedCaller(
  "0x用户地址" as Address
);

// 移除授权调用者（需要所有者权限）
await delegateClient.removeAuthorizedCaller(
  "0x用户地址" as Address
);
```

### 紧急功能

```typescript
// 设置暂停状态（需要所有者权限）
await delegateClient.setPaused(true);

// 紧急提取代币（需要所有者权限）
await delegateClient.emergencyWithdraw(
  "0x代币地址" as Address,
  "0x接收地址" as Address,
  parseUnits("100", 18)
);

// 紧急提取 ETH（需要所有者权限）
await delegateClient.emergencyWithdrawETH(
  "0x接收地址" as Address,
  parseEther("1.0")
);
```

## 测试模块

### 运行完整测试

```bash
# 运行所有测试
npx ts-node demo/src/work/W4-D5-Delegate-Tests.ts

# 运行特定测试模块
npx ts-node demo/src/work/W4-D5-Delegate-Tests.ts --test=query
npx ts-node demo/src/work/W4-D5-Delegate-Tests.ts --test=multicall
```

### 可用的测试模块

1. **query** - 查询功能测试
   - 查询合约所有者
   - 查询暂停状态
   - 查询余额信息
   - 查询授权信息

2. **permission** - 权限管理测试
   - 检查授权状态
   - 添加/移除授权调用者

3. **deposit** - 授权和存款测试
   - 单个代币授权并存款
   - 批量代币授权并存款

4. **multicall** - 批量调用测试
   - 普通批量调用
   - 批量代理调用
   - 带价值的批量调用

5. **delegate** - 代理调用测试
   - 单个代理调用功能

6. **emergency** - 紧急功能测试
   - 暂停/恢复合约
   - 紧急提取功能

7. **integrated** - 综合功能测试
   - 复合操作测试
   - 状态验证

## 错误处理

所有方法都包含完善的错误处理：

```typescript
try {
  await delegateClient.approveAndDeposit(token, bank, amount);
  console.log("✅ 操作成功");
} catch (error) {
  console.error("❌ 操作失败:", error.message);
  // 处理错误...
}
```

## 安全注意事项

1. **权限管理**：确保只有授权用户可以调用特定功能
2. **参数验证**：所有输入参数都会进行基本验证
3. **错误处理**：完善的错误捕获和处理机制
4. **测试环境**：建议先在测试网络中充分测试
5. **紧急功能**：紧急停止和提取功能应谨慎使用

## 依赖项

- `viem` - 以太坊交互库
- `typescript` - TypeScript 支持

## 合约部署

在使用客户端之前，请确保：

1. Delegate 合约已部署到 Sepolia 测试网
2. TokenBank 合约已部署并可用
3. 测试代币合约已部署
4. 账户有足够的 ETH 和代币余额
5. 正确设置了合约地址配置

## 常见问题

### Q: 如何获取合约地址？
A: 部署合约后，从部署交易回执中获取合约地址，或通过区块链浏览器查看。

### Q: 为什么某些操作失败？
A: 可能的原因：
- 账户余额不足
- 没有相应权限
- 合约处于暂停状态
- 网络问题

### Q: 如何调试问题？
A: 
1. 检查控制台日志输出
2. 验证合约地址配置
3. 确认账户权限和余额
4. 在测试网络中逐步测试

## 支持

如有问题，请检查：
1. 合约地址配置是否正确
2. 环境变量是否设置
3. 网络连接是否正常
4. 账户是否有足够权限和余额