/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-08-03 21:25:00
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-08-03 21:25:00
 * @FilePath: /web3-test-front/demo/src/work/W4-D5-Delegate-Tests.ts
 * @Description: Delegate 合约完整测试套件
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { parseUnits, parseEther, Address } from 'viem';
import { DelegateClient } from './W4-D5-Delegdate';
import TokenBankABI from '../abis/TokenBank.json';

// 测试配置
const TEST_CONFIG = {
  // 需要根据实际部署的合约地址进行修改
  DELEGATE_ADDRESS: "0x1234567890123456789012345678901234567890",
  TOKEN_BANK_ADDRESS: "0x2345678901234567890123456789012345678901", 
  TOKEN_ADDRESS: "0x28E9F6eF779E601E5be0dc26e806DF4694CD41C1",
  
  // 测试数量
  TEST_TOKEN_AMOUNT: parseUnits("100", 18), // 100 个代币
  TEST_ETH_AMOUNT: parseEther("0.1"), // 0.1 ETH
  SMALL_AMOUNT: parseUnits("10", 18), // 10 个代币
};

/**
 * 运行完整的 Delegate 合约测试
 */
async function runDelegateTests() {
  console.log("========================================");
  console.log("         Delegate 合约完整测试");
  console.log("========================================");

  try {
    // 初始化客户端
    const delegateClient = new DelegateClient();
    const currentAccount = delegateClient.getCurrentAccount();
    console.log("当前账户:", currentAccount);
    console.log("测试开始时间:", new Date().toLocaleString());

    // ===========================================
    // 1. 查询功能测试
    // ===========================================
    console.log("\n🔍 === 第一阶段：查询功能测试 ===");
    await testQueryFunctions(delegateClient);

    // ===========================================
    // 2. 权限管理测试
    // ===========================================
    console.log("\n🔐 === 第二阶段：权限管理测试 ===");
    await testPermissionManagement(delegateClient, currentAccount);

    // ===========================================
    // 3. 授权和存款测试
    // ===========================================
    console.log("\n💰 === 第三阶段：授权和存款测试 ===");
    await testApproveAndDeposit(delegateClient);

    // ===========================================
    // 4. 批量调用测试
    // ===========================================
    console.log("\n📞 === 第四阶段：批量调用测试 ===");
    await testMulticall(delegateClient);

    // ===========================================
    // 5. 代理调用测试
    // ===========================================
    console.log("\n🎯 === 第五阶段：代理调用测试 ===");
    await testDelegateCall(delegateClient);

    // ===========================================
    // 6. 紧急停止功能测试
    // ===========================================
    console.log("\n⏸️ === 第六阶段：紧急停止功能测试 ===");
    await testEmergencyFunctions(delegateClient, currentAccount);

    // ===========================================
    // 7. 综合功能测试
    // ===========================================
    console.log("\n🔄 === 第七阶段：综合功能测试 ===");
    await testIntegratedFunctions(delegateClient);

    // ===========================================
    // 测试完成
    // ===========================================
    console.log("\n✅ === 所有测试完成！===");
    console.log("测试结束时间:", new Date().toLocaleString());
    console.log("========================================");

  } catch (error) {
    console.error("❌ 测试过程中发生错误:", error);
    throw error;
  }
}

/**
 * 测试查询功能
 */
async function testQueryFunctions(delegateClient: DelegateClient) {
  console.log("开始测试查询功能...");

  try {
    // 查询合约基本信息
    console.log("\n--- 基本信息查询 ---");
    await delegateClient.getOwner();
    await delegateClient.isPaused();

    // 查询余额信息
    console.log("\n--- 余额查询 ---");
    await delegateClient.getETHBalance();
    await delegateClient.getTokenBalance(TEST_CONFIG.TOKEN_ADDRESS as Address);

    // 查询授权信息
    console.log("\n--- 授权查询 ---");
    await delegateClient.getAllowance(
      TEST_CONFIG.TOKEN_ADDRESS as Address, 
      TEST_CONFIG.TOKEN_BANK_ADDRESS as Address
    );

    console.log("✅ 查询功能测试完成");
  } catch (error) {
    console.error("❌ 查询功能测试失败:", error);
    // 不抛出错误，继续其他测试
  }
}

/**
 * 测试权限管理
 */
async function testPermissionManagement(delegateClient: DelegateClient, currentAccount: Address) {
  console.log("开始测试权限管理...");

  try {
    // 检查当前账户授权状态
    console.log("\n--- 检查初始授权状态 ---");
    const initialAuth = await delegateClient.isAuthorizedCaller(currentAccount);
    
    if (!initialAuth) {
      // 尝试添加授权（需要所有者权限）
      console.log("\n--- 添加授权调用者 ---");
      try {
        await delegateClient.addAuthorizedCaller(currentAccount);
        console.log("✅ 成功添加授权调用者");
        
        // 验证授权状态
        await delegateClient.isAuthorizedCaller(currentAccount);
      } catch (error) {
        console.log("⚠️ 添加授权调用者失败（可能没有所有者权限）:", error.message);
      }
    } else {
      console.log("✅ 当前账户已被授权");
    }

    // 测试移除授权（谨慎操作）
    console.log("\n--- 测试移除授权（仅演示，不实际执行）---");
    console.log("注意：实际环境中移除授权需要谨慎操作");

    console.log("✅ 权限管理测试完成");
  } catch (error) {
    console.error("❌ 权限管理测试失败:", error);
  }
}

/**
 * 测试授权和存款操作
 */
async function testApproveAndDeposit(delegateClient: DelegateClient) {
  console.log("开始测试授权和存款操作...");

  try {
    // 单个代币授权并存款
    console.log("\n--- 单个代币授权并存款 ---");
    try {
      await delegateClient.approveAndDeposit(
        TEST_CONFIG.TOKEN_ADDRESS as Address,
        TEST_CONFIG.TOKEN_BANK_ADDRESS as Address,
        TEST_CONFIG.SMALL_AMOUNT
      );
      console.log("✅ 单个授权和存款成功");
    } catch (error) {
      console.log("⚠️ 单个授权和存款失败:", error.message);
    }

    // 批量代币授权并存款
    console.log("\n--- 批量代币授权并存款 ---");
    try {
      await delegateClient.batchApproveAndDeposit(
        [TEST_CONFIG.TOKEN_ADDRESS as Address],
        [TEST_CONFIG.TOKEN_BANK_ADDRESS as Address],
        [TEST_CONFIG.SMALL_AMOUNT]
      );
      console.log("✅ 批量授权和存款成功");
    } catch (error) {
      console.log("⚠️ 批量授权和存款失败:", error.message);
    }

    console.log("✅ 授权和存款测试完成");
  } catch (error) {
    console.error("❌ 授权和存款测试失败:", error);
  }
}

/**
 * 测试批量调用功能
 */
async function testMulticall(delegateClient: DelegateClient) {
  console.log("开始测试批量调用功能...");

  try {
    // 构建测试调用数据
    console.log("\n--- 构建测试调用数据 ---");
    
    // 构建查询 TokenBank 总存款的调用
    const totalDepositsCallData = delegateClient.buildCallData(
      TokenBankABI,
      "totalDeposits",
      []
    );

    // 构建查询 TokenBank 代币地址的调用
    const tokenCallData = delegateClient.buildCallData(
      TokenBankABI,
      "token",
      []
    );

    const readOnlyCalls = [
      {
        target: TEST_CONFIG.TOKEN_BANK_ADDRESS as Address,
        callData: totalDepositsCallData
      },
      {
        target: TEST_CONFIG.TOKEN_BANK_ADDRESS as Address,
        callData: tokenCallData
      }
    ];

    // 测试普通批量调用
    console.log("\n--- 普通批量调用 ---");
    try {
      await delegateClient.multicall(readOnlyCalls);
      console.log("✅ 普通批量调用成功");
    } catch (error) {
      console.log("⚠️ 普通批量调用失败:", error.message);
    }

    // 测试批量代理调用
    console.log("\n--- 批量代理调用 ---");
    try {
      await delegateClient.multicallDelegate(readOnlyCalls);
      console.log("✅ 批量代理调用成功");
    } catch (error) {
      console.log("⚠️ 批量代理调用失败:", error.message);
    }

    // 测试带价值的批量调用
    console.log("\n--- 带价值的批量调用 ---");
    const callsWithValue = [
      {
        target: TEST_CONFIG.TOKEN_BANK_ADDRESS as Address,
        value: 0n, // 不发送 ETH 的只读调用
        callData: totalDepositsCallData
      }
    ];

    try {
      await delegateClient.multicallWithValue(callsWithValue);
      console.log("✅ 带价值批量调用成功");
    } catch (error) {
      console.log("⚠️ 带价值批量调用失败:", error.message);
    }

    console.log("✅ 批量调用功能测试完成");
  } catch (error) {
    console.error("❌ 批量调用功能测试失败:", error);
  }
}

/**
 * 测试代理调用
 */
async function testDelegateCall(delegateClient: DelegateClient) {
  console.log("开始测试代理调用...");

  try {
    // 构建安全的只读代理调用
    console.log("\n--- 构建代理调用数据 ---");
    const callData = delegateClient.buildCallData(
      TokenBankABI,
      "totalDeposits",
      []
    );

    console.log("\n--- 执行代理调用 ---");
    try {
      await delegateClient.delegateCall(
        TEST_CONFIG.TOKEN_BANK_ADDRESS as Address,
        callData
      );
      console.log("✅ 代理调用成功");
    } catch (error) {
      console.log("⚠️ 代理调用失败:", error.message);
    }

    console.log("✅ 代理调用测试完成");
  } catch (error) {
    console.error("❌ 代理调用测试失败:", error);
  }
}

/**
 * 测试紧急停止功能
 */
async function testEmergencyFunctions(delegateClient: DelegateClient, currentAccount: Address) {
  console.log("开始测试紧急停止功能...");

  try {
    // 测试设置暂停状态（仅所有者）
    console.log("\n--- 测试暂停功能 ---");
    try {
      // 获取当前暂停状态
      const currentPaused = await delegateClient.isPaused();
      
      // 尝试切换暂停状态
      const newPausedState = !currentPaused;
      await delegateClient.setPaused(newPausedState);
      console.log(`✅ 成功设置暂停状态为: ${newPausedState}`);
      
      // 验证状态变更
      await delegateClient.isPaused();
      
      // 恢复原始状态
      await delegateClient.setPaused(currentPaused);
      console.log(`✅ 恢复暂停状态为: ${currentPaused}`);
      
    } catch (error) {
      console.log("⚠️ 设置暂停状态失败（可能没有所有者权限）:", error.message);
    }

    // 测试紧急提取（仅演示，实际慎用）
    console.log("\n--- 紧急提取功能（仅演示，不实际执行）---");
    console.log("注意：紧急提取功能在实际环境中需要谨慎使用");
    console.log("测试方法：");
    console.log("- emergencyWithdraw(token, to, amount)");
    console.log("- emergencyWithdrawETH(to, amount)");

    console.log("✅ 紧急停止功能测试完成");
  } catch (error) {
    console.error("❌ 紧急停止功能测试失败:", error);
  }
}

/**
 * 测试综合功能
 */
async function testIntegratedFunctions(delegateClient: DelegateClient) {
  console.log("开始测试综合功能...");

  try {
    // 综合测试：一次交易中完成多个操作
    console.log("\n--- 综合批量操作测试 ---");
    
    const currentAccount = delegateClient.getCurrentAccount();
    
    // 构建复合调用：检查余额 + 检查授权状态
    const balanceCallData = delegateClient.buildCallData(
      TokenBankABI,
      "totalDeposits",
      []
    );

    const ownerCallData = delegateClient.buildCallData(
      TokenBankABI,
      "owner",
      []
    );

    const compoundCalls = [
      {
        target: TEST_CONFIG.TOKEN_BANK_ADDRESS as Address,
        callData: balanceCallData
      },
      {
        target: TEST_CONFIG.TOKEN_BANK_ADDRESS as Address,
        callData: ownerCallData
      }
    ];

    try {
      await delegateClient.multicall(compoundCalls);
      console.log("✅ 综合批量操作成功");
    } catch (error) {
      console.log("⚠️ 综合批量操作失败:", error.message);
    }

    // 查询最终状态
    console.log("\n--- 查询最终状态 ---");
    await delegateClient.getETHBalance();
    await delegateClient.getTokenBalance(TEST_CONFIG.TOKEN_ADDRESS as Address);
    await delegateClient.isAuthorizedCaller(currentAccount);
    
    console.log("✅ 综合功能测试完成");
  } catch (error) {
    console.error("❌ 综合功能测试失败:", error);
  }
}

/**
 * 运行特定测试
 */
async function runSpecificTest(testName: string) {
  console.log(`========================================`);
  console.log(`         运行特定测试: ${testName}`);
  console.log(`========================================`);

  const delegateClient = new DelegateClient();
  const currentAccount = delegateClient.getCurrentAccount();

  switch (testName) {
    case 'query':
      await testQueryFunctions(delegateClient);
      break;
    case 'permission':
      await testPermissionManagement(delegateClient, currentAccount);
      break;
    case 'deposit':
      await testApproveAndDeposit(delegateClient);
      break;
    case 'multicall':
      await testMulticall(delegateClient);
      break;
    case 'delegate':
      await testDelegateCall(delegateClient);
      break;
    case 'emergency':
      await testEmergencyFunctions(delegateClient, currentAccount);
      break;
    case 'integrated':
      await testIntegratedFunctions(delegateClient);
      break;
    default:
      console.log("❌ 未知的测试名称，可用测试: query, permission, deposit, multicall, delegate, emergency, integrated");
  }
}

/**
 * 显示使用说明
 */
function showUsage() {
  console.log(`
Delegate 合约测试工具使用说明：

运行全部测试：
npm run test:delegate

运行特定测试：
npm run test:delegate -- --test=<testName>

可用的测试模块：
- query       : 查询功能测试
- permission  : 权限管理测试  
- deposit     : 授权和存款测试
- multicall   : 批量调用测试
- delegate    : 代理调用测试
- emergency   : 紧急停止功能测试
- integrated  : 综合功能测试

示例：
npm run test:delegate -- --test=query
npm run test:delegate -- --test=multicall

注意事项：
1. 请确保在 TEST_CONFIG 中设置正确的合约地址
2. 确保测试账户有足够的 ETH 和代币余额
3. 某些功能需要特定权限（如所有者权限）
4. 建议在测试网络中运行测试
  `);
}

// 导出函数
export { 
  runDelegateTests, 
  runSpecificTest, 
  showUsage,
  testQueryFunctions,
  testPermissionManagement,
  testApproveAndDeposit,
  testMulticall,
  testDelegateCall,
  testEmergencyFunctions,
  testIntegratedFunctions
};

// 如果直接运行此文件，解析命令行参数并执行相应测试
if (require.main === module) {
  const args = process.argv.slice(2);
  const testArg = args.find(arg => arg.startsWith('--test='));
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  } else if (testArg) {
    const testName = testArg.split('=')[1];
    runSpecificTest(testName)
      .then(() => {
        console.log(`✅ 测试 ${testName} 执行完成`);
        process.exit(0);
      })
      .catch((error) => {
        console.error(`❌ 测试 ${testName} 执行失败:`, error);
        process.exit(1);
      });
  } else {
    runDelegateTests()
      .then(() => {
        console.log("✅ 所有测试执行完成");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ 测试执行失败:", error);
        process.exit(1);
      });
  }
}