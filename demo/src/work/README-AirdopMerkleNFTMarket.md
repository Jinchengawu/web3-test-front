# AirdopMerkleNFTMarket 使用指南

## 概述

这个模块实现了基于 Merkle 树的 NFT 空投市场功能，支持白名单验证和优惠购买。

## 功能特性

- ✅ **Merkle 树验证**: 基于白名单验证用户资格
- ✅ **优惠购买**: 白名单用户享受 50% 折扣
- ✅ **Multicall 支持**: 一次性执行多个操作
- ✅ **Permit 支持**: 支持 EIP-2612 permit 授权（需要 Token 合约支持）
- ✅ **Approve 支持**: 兼容传统 approve 方式

## 文件结构

```
demo/src/work/
├── W4-D4-AirdopMerkleNFTMarket.ts  # 主要实现文件
├── test-airdrop.ts                  # 测试文件
├── private-client.ts                # 客户端配置
└── README-AirdopMerkleNFTMarket.md # 使用说明
```

## 配置要求

### 1. 环境变量

在 `.env` 文件中配置：

```bash
PRIVATE_KEY=0x...                    # 你的私钥
QUICKNODE_ENDPOINT=https://...       # RPC 端点
```

### 2. 合约地址

在 `W4-D4-AirdopMerkleNFTMarket.ts` 中配置合约地址：

```typescript
const CONTRACT_ADDRESSES = {
  AIRDROP_MERKLE_NFT_MARKET: "0x...", // AirdopMerkleNFTMarket 合约地址
  TOKEN: "0x...",                     // Token 合约地址（支持 permit）
  NFT: "0x...",                       // NFT 合约地址
}
```

## 使用方法

### 1. 基本使用

```typescript
import { main, testMerkleTree } from './W4-D4-AirdopMerkleNFTMarket';

// 测试 Merkle 树
await testMerkleTree();

// 执行主逻辑
await main();
```

### 2. 手动执行 approve + claimNFT

```typescript
import { executeApproveAndClaim } from './W4-D4-AirdopMerkleNFTMarket';

const discountedPrice = BigInt(1000000000000000000); // 1 ETH
const maxAmount = BigInt(30);
const proof = ['0x...', '0x...'] as `0x${string}`[];

const result = await executeApproveAndClaim(discountedPrice, maxAmount, proof);
console.log('交易哈希:', result);
```

### 3. 手动执行 permit + claimNFT（需要支持 permit 的 Token）

```typescript
import { executePermitAndClaim } from './W4-D4-AirdopMerkleNFTMarket';

const discountedPrice = BigInt(1000000000000000000); // 1 ETH
const maxAmount = BigInt(30);
const proof = ['0x...', '0x...'] as `0x${string}`[];

const result = await executePermitAndClaim(discountedPrice, maxAmount, proof);
console.log('交易哈希:', result);
```

## 白名单配置

当前配置的白名单用户：

```typescript
const users = [
  { address: "0xD08c8e6d78a1f64B1796d6DC3137B19665cb6F1F", amount: BigInt(10) },
  { address: "0xb7D15753D3F76e7C892B63db6b4729f700C01298", amount: BigInt(15) },
  { address: "0xf69Ca530Cd4849e3d1329FBEC06787a96a3f9A68", amount: BigInt(20) },
  { address: "0xa8532aAa27E9f7c3a96d754674c99F1E2f824800", amount: BigInt(30) },
];
```

## 运行测试

```bash
# 运行所有测试
npx ts-node demo/src/work/test-airdrop.ts

# 运行主逻辑
npx ts-node demo/src/work/W4-D4-AirdopMerkleNFTMarket.ts
```

## 工作流程

### 1. Merkle 树构建
```typescript
// 构建 Merkle 树
const elements = users.map((x) =>
  keccak256(encodePacked(["address", "uint256"], [x.address, x.amount]))
);
const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
```

### 2. 白名单验证
```typescript
// 验证用户是否在白名单中
const isWhitelisted = await marketContract.read.verifyMerkleProof([
  userAddress,
  userAmount,
  merkleProof
]);
```

### 3. 价格计算
```typescript
// 计算折扣价格（50% 优惠）
const discountedPrice = await marketContract.read.calculateDiscountedPrice([originalPrice]);
```

### 4. 执行交易

#### 方法 1: Approve + ClaimNFT
```typescript
// 1. 先 approve
await tokenContract.write.approve([marketAddress, amount]);

// 2. 再 claimNFT
await marketContract.write.claimNFT([listingId, maxAmount, proof]);
```

#### 方法 2: Multicall (Permit + ClaimNFT)
```typescript
// 一次性执行 permitPrePay + claimNFT
await marketContract.write.multicall([
  [permitData, claimData]
]);
```

## 注意事项

1. **Token 合约要求**: 如果要使用 permit 功能，Token 合约必须支持 EIP-2612
2. **余额检查**: 确保用户有足够的 Token 余额
3. **白名单验证**: 确保用户在 Merkle 树白名单中
4. **Gas 费用**: 预留足够的 ETH 支付 gas 费用
5. **网络配置**: 确保连接到正确的网络（Sepolia 测试网）

## 错误处理

常见错误及解决方案：

- **"用户不在白名单中"**: 检查用户地址和数量是否正确
- **"Token 余额不足"**: 确保用户有足够的 Token
- **"交易失败"**: 检查 gas 费用和网络连接
- **"合约地址错误"**: 验证合约地址配置

## 扩展功能

### 1. 添加新的白名单用户

```typescript
const newUsers = [
  ...users,
  { address: "0x...", amount: BigInt(25) }
];
```

### 2. 自定义折扣比例

在合约中修改 `DISCOUNT_RATIO` 常量。

### 3. 支持多种 Token

修改 `CONTRACT_ADDRESSES.TOKEN` 配置。

## 技术支持

如有问题，请检查：
1. 合约地址配置
2. 网络连接
3. 用户权限
4. Token 余额
5. 白名单状态 