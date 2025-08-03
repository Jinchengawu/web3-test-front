/*
 * EIP-7702 DelegateClient 使用示例
 * 演示如何使用基于账户抽象的 Delegate 客户端
 */

import { parseUnits } from 'viem';
import { DelegateClient } from './W4-D5-Delegdate';

async function demonstrateEIP7702Usage() {
  console.log("🚀 === EIP-7702 DelegateClient 演示 ===");
  
  // 1. 初始化客户端
  const client = new DelegateClient();
  
  // 2. 检查并确保 EIP-7702 授权
  console.log("\n📋 检查 EIP-7702 状态...");
  await client.ensureEIP7702Authorization();
  
  // 3. 查看授权状态
  const status = client.getEIP7702Status();
  console.log("📊 当前状态:", status);
  
  // 4. 执行单个代币授权并存款（通过 EIP-7702）
  console.log("\n💰 执行代币授权并存款...");
  try {
    await client.approveAndDeposit(
      "0x28E9F6eF779E601E5be0dc26e806DF4694CD41C1", // 代币地址
      "0x2345678901234567890123456789012345678901", // TokenBank 地址
      parseUnits("100", 18) // 100 个代币
    );
    console.log("✅ 单个授权并存款成功");
  } catch (error) {
    console.error("❌ 单个授权并存款失败:", error);
  }
  
  // 5. 执行批量操作（通过 EIP-7702）
  console.log("\n🔄 执行批量操作...");
  try {
    const tokens = ["0x28E9F6eF779E601E5be0dc26e806DF4694CD41C1"];
    const tokenBanks = ["0x2345678901234567890123456789012345678901"];
    const amounts = [parseUnits("50", 18)];
    
    await client.batchApproveAndDeposit(tokens, tokenBanks, amounts);
    console.log("✅ 批量授权并存款成功");
  } catch (error) {
    console.error("❌ 批量授权并存款失败:", error);
  }
  
  // 6. 执行批量调用（通过 EIP-7702）
  console.log("\n📞 执行批量调用...");
  try {
    const calls = [
      {
        target: "0x28E9F6eF779E601E5be0dc26e806DF4694CD41C1" as const,
        callData: "0x1234567890abcdef" as const,
      }
    ];
    
    await client.multicall(calls);
    console.log("✅ 批量调用成功");
  } catch (error) {
    console.error("❌ 批量调用失败:", error);
  }
  
  // 7. 查询功能（不需要 EIP-7702）
  console.log("\n🔍 查询合约状态...");
  try {
    const owner = await client.getOwner();
    const paused = await client.isPaused();
    
    console.log("合约所有者:", owner);
    console.log("是否暂停:", paused);
  } catch (error) {
    console.error("❌ 查询失败:", error);
  }
  
  // 8. 清理 EIP-7702 授权（可选）
  console.log("\n🧹 清理 EIP-7702 授权...");
  try {
    await client.cleanupEIP7702();
    console.log("✅ 授权清理完成");
  } catch (error) {
    console.error("❌ 授权清理失败:", error);
  }
  
  console.log("\n🎉 === EIP-7702 演示完成 ===");
}

// 执行演示
demonstrateEIP7702Usage().catch(console.error);

export { demonstrateEIP7702Usage };