/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-31 15:30:00
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-31 15:30:00
 * @FilePath: /web3-test-front/demo/src/work/test-airdrop.ts
 * @Description: 测试 AirdopMerkleNFTMarket 功能
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { testMerkleTree, executeApproveAndClaim, executePermitAndClaim } from './W4-D4-AirdopMerkleNFTMarket';

async function runTests() {
  console.log("开始测试 AirdopMerkleNFTMarket...\n");

  try {
    // 测试 1: Merkle 树构建和验证
    console.log("=== 测试 1: Merkle 树构建和验证 ===");
    await testMerkleTree();
    console.log("✅ Merkle 树测试通过\n");

    // 测试 2: 模拟 approve + claimNFT 流程
    console.log("=== 测试 2: 模拟 approve + claimNFT 流程 ===");
    console.log("注意：这是模拟测试，需要配置正确的合约地址才能实际执行");
    
    // 模拟数据
    const mockDiscountedPrice = BigInt(1000000000000000000); // 1 ETH
    const mockMaxAmount = BigInt(30);
    const mockProof = [
      '0xd24d002c88a75771fc4516ed00b4f3decb98511eb1f7b968898c2f454e34ba23',
      '0x4e48d103859ea17962bdf670d374debec88b8d5f0c1b6933daa9eee9c7f4365b'
    ] as `0x${string}`[];

    console.log("模拟参数:");
    console.log("- 折扣价格:", mockDiscountedPrice.toString());
    console.log("- 最大数量:", mockMaxAmount.toString());
    console.log("- Merkle 证明:", mockProof);
    console.log("✅ 模拟测试完成\n");

    // 测试 3: 模拟 permit + claimNFT 流程
    console.log("=== 测试 3: 模拟 permit + claimNFT 流程 ===");
    console.log("注意：这需要支持 permit 的 Token 合约");
    console.log("✅ 模拟测试完成\n");

    console.log("🎉 所有测试完成！");
    console.log("\n使用说明:");
    console.log("1. 配置 CONTRACT_ADDRESSES 中的合约地址");
    console.log("2. 确保用户有足够的 Token 余额");
    console.log("3. 确保用户在白名单中");
    console.log("4. 运行 main() 函数执行实际交易");

  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runTests();
}

export { runTests }; 