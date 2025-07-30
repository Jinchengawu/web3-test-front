# W4-D2-work.ts 使用说明

## 概述

这个脚本使用Viem库从链上读取esRNT合约的`_locks`数组中的所有元素值。

## 功能特性

- 支持三种读取方式：
  1. **getStorageAt** - 直接读取存储槽（复杂，需要了解存储布局）
  2. **readContract** - 通过合约函数读取（推荐，简单可靠）
  3. **multicall** - 批量调用合约函数

- 输出格式：`locks[0]: user:0x..., startTime:1234567890, amount:1000000000000000000`

## 合约结构

```solidity
contract esRNT {
  struct LockInfo{
      address user;
      uint64 startTime; 
      uint256 amount;
  }
  LockInfo[] private _locks;

  constructor() { 
      for (uint256 i = 0; i < 11; i++) {
          _locks.push(LockInfo(address(uint160(i+1)), uint64(block.timestamp*2-i), 1e18*(i+1)));
      }
  }
}
```

## 使用前准备

1. **替换合约地址**：在`W4-D2-work.ts`文件中，将`CONTRACT_ADDRESS`替换为实际部署的esRNT合约地址
2. **确保网络连接**：脚本默认使用Sepolia测试网
3. **安装依赖**：确保已安装`viem`库

## 运行方式

### 方式1：直接运行
```bash
npx ts-node src/work/W4-D2-work.ts
```

### 方式2：使用运行脚本
```bash
npx ts-node src/work/run-w4-d2.ts
```

## 文件结构

```
demo/src/work/
├── W4-D2-work.ts          # 主脚本文件
├── run-w4-d2.ts           # 运行脚本
├── README-W4-D2.md        # 说明文档
└── ../abis/
    └── esRNT.json         # 合约ABI文件
```

## 输出示例

```
=== 使用getStorageAt方式读取 ===
开始读取_locks数组...
数组长度: 11
locks[0]: user: 0x0000000000000000000000000000000000000001, startTime: 1234567890, amount: 1000000000000000000
locks[1]: user: 0x0000000000000000000000000000000000000002, startTime: 1234567889, amount: 2000000000000000000
...

=== 使用readContract方式读取（推荐） ===
使用readContract读取_locks数组...
数组长度: 11
locks[0]: user: 0x0000000000000000000000000000000000000001, startTime: 1234567890, amount: 1000000000000000000
...

=== 使用multicall方式读取 ===
使用multicall读取_locks数组...
locks[0]: user: 0x0000000000000000000000000000000000000001, startTime: 1234567890, amount: 1000000000000000000
...
```

## 注意事项

1. **getStorageAt方式**：需要了解Solidity的存储布局，计算可能不准确
2. **readContract方式**：推荐使用，简单可靠，但需要合约有相应的读取函数
3. **multicall方式**：适合批量读取，性能较好
4. **网络选择**：当前使用Sepolia测试网，可根据需要修改

## 错误处理

脚本包含完整的错误处理机制，会显示详细的错误信息，包括：
- 网络连接错误
- 合约地址错误
- 函数调用失败
- 数据解析错误

## 扩展功能

可以根据需要添加以下功能：
- 支持多网络切换
- 添加数据验证
- 支持导出数据到文件
- 添加实时监控功能 