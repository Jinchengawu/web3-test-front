/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-08-03 21:19:07
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-08-03 21:21:29
 * @FilePath: /web3-test-front/demo/src/work/W4-D5-Delegdate.ts
 * @Description: Delegate 合约客户端实现 - 支持批量执行和代理调用
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { 
  getContract, 
  createPublicClient, 
  http, 
  parseEther, 
  formatEther, 
  encodeFunctionData,
  parseUnits,
  formatUnits,
  Address
} from 'viem';
import { sepolia } from 'viem/chains';
import { privateClient } from './private-client';
import DelegateABI from '../abis/Delegate.json';
import TokenBankABI from '../abis/TokenBank.json';
import MyERC20ABI from '../abis/MyERC20.json';

// 创建公共客户端用于读取操作
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.QUICKNODE_ENDPOINT),
});

// 合约地址配置 - 需要根据实际部署的合约地址进行修改
const CONTRACT_ADDRESSES = {
  DELEGATE: "0x1234567890123456789012345678901234567890", // 替换为实际的 Delegate 合约地址
  TOKEN_BANK: "0x2345678901234567890123456789012345678901", // 替换为实际的 TokenBank 合约地址
  TOKEN: "0x28E9F6eF779E601E5be0dc26e806DF4694CD41C1", // 测试代币地址
};

/**
 * Delegate 合约客户端类
 * 功能特性：
 * 1. 支持批量执行（multicall）
 * 2. 支持代理调用（delegatecall）
 * 3. 支持与 TokenBank 的授权和存款操作
 * 4. 支持紧急停止功能
 */
class DelegateClient {
  private delegateContract: any;
  private tokenBankContract: any;
  private tokenContract: any;
  private account: Address;

  constructor() {
    // 获取当前账户
    this.account = privateClient.account?.address as Address;
    if (!this.account) {
      throw new Error("No account found in privateClient");
    }

    // 初始化合约实例
    this.delegateContract = getContract({
      address: CONTRACT_ADDRESSES.DELEGATE as Address,
      abi: DelegateABI,
      client: privateClient,
    });

    this.tokenBankContract = getContract({
      address: CONTRACT_ADDRESSES.TOKEN_BANK as Address,
      abi: TokenBankABI,
      client: privateClient,
    });

    this.tokenContract = getContract({
      address: CONTRACT_ADDRESSES.TOKEN as Address,
      abi: MyERC20ABI,
      client: privateClient,
    });
  }

  /**
   * ===========================================
   * 1. 授权和存款操作
   * ===========================================
   */

  /**
   * 单个代币授权并存款
   */
  async approveAndDeposit(tokenAddress: Address, tokenBankAddress: Address, amount: bigint) {
    console.log("\n=== 执行单个代币授权并存款 ===");
    console.log("代币地址:", tokenAddress);
    console.log("TokenBank地址:", tokenBankAddress);
    console.log("存款数量:", formatUnits(amount, 18));

    try {
      const txHash = await this.delegateContract.write.approveAndDeposit([
        tokenAddress,
        tokenBankAddress,
        amount
      ]);

      console.log("交易已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("交易确认成功，区块号:", receipt.blockNumber);
      console.log("Gas 使用量:", receipt.gasUsed);

      return receipt;
    } catch (error) {
      console.error("授权并存款失败:", error);
      throw error;
    }
  }

  /**
   * 批量代币授权并存款
   */
  async batchApproveAndDeposit(tokens: Address[], tokenBanks: Address[], amounts: bigint[]) {
    console.log("\n=== 执行批量代币授权并存款 ===");
    console.log("代币数量:", tokens.length);
    console.log("代币地址:", tokens);
    console.log("TokenBank地址:", tokenBanks);
    console.log("存款数量:", amounts.map(amt => formatUnits(amt, 18)));

    if (tokens.length !== tokenBanks.length || tokens.length !== amounts.length) {
      throw new Error("数组长度不一致");
    }

    try {
      const txHash = await this.delegateContract.write.batchApproveAndDeposit([
        tokens,
        tokenBanks,
        amounts
      ]);

      console.log("批量交易已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("批量交易确认成功，区块号:", receipt.blockNumber);
      console.log("Gas 使用量:", receipt.gasUsed);

      return receipt;
    } catch (error) {
      console.error("批量授权并存款失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 2. 批量调用功能
   * ===========================================
   */

  /**
   * 普通批量调用
   */
  async multicall(calls: { target: Address; callData: `0x${string}` }[]) {
    console.log("\n=== 执行普通批量调用 ===");
    console.log("调用数量:", calls.length);

    try {
      const txHash = await this.delegateContract.write.multicall([calls]);
      console.log("批量调用已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("批量调用确认成功，区块号:", receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error("批量调用失败:", error);
      throw error;
    }
  }

  /**
   * 批量代理调用
   */
  async multicallDelegate(calls: { target: Address; callData: `0x${string}` }[]) {
    console.log("\n=== 执行批量代理调用 ===");
    console.log("调用数量:", calls.length);

    try {
      const txHash = await this.delegateContract.write.multicallDelegate([calls]);
      console.log("批量代理调用已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("批量代理调用确认成功，区块号:", receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error("批量代理调用失败:", error);
      throw error;
    }
  }

  /**
   * 带价值的批量调用
   */
  async multicallWithValue(calls: { target: Address; value: bigint; callData: `0x${string}` }[]) {
    console.log("\n=== 执行带价值的批量调用 ===");
    console.log("调用数量:", calls.length);

    const totalValue = calls.reduce((sum, call) => sum + call.value, 0n);
    
    try {
      const txHash = await this.delegateContract.write.multicallWithValue([calls], {
        value: totalValue
      });
      console.log("带价值批量调用已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("带价值批量调用确认成功，区块号:", receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error("带价值批量调用失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 3. 代理调用
   * ===========================================
   */

  /**
   * 单个代理调用
   */
  async delegateCall(target: Address, data: `0x${string}`) {
    console.log("\n=== 执行代理调用 ===");
    console.log("目标地址:", target);
    console.log("调用数据:", data);

    try {
      const txHash = await this.delegateContract.write.delegateCall([target, data]);
      console.log("代理调用已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("代理调用确认成功，区块号:", receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error("代理调用失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 4. 权限管理
   * ===========================================
   */

  /**
   * 添加授权调用者
   */
  async addAuthorizedCaller(caller: Address) {
    console.log("\n=== 添加授权调用者 ===");
    console.log("调用者地址:", caller);

    try {
      const txHash = await this.delegateContract.write.addAuthorizedCaller([caller]);
      console.log("添加授权调用者已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("添加授权调用者确认成功");

      return receipt;
    } catch (error) {
      console.error("添加授权调用者失败:", error);
      throw error;
    }
  }

  /**
   * 移除授权调用者
   */
  async removeAuthorizedCaller(caller: Address) {
    console.log("\n=== 移除授权调用者 ===");
    console.log("调用者地址:", caller);

    try {
      const txHash = await this.delegateContract.write.removeAuthorizedCaller([caller]);
      console.log("移除授权调用者已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("移除授权调用者确认成功");

      return receipt;
    } catch (error) {
      console.error("移除授权调用者失败:", error);
      throw error;
    }
  }

  /**
   * 检查是否为授权调用者
   */
  async isAuthorizedCaller(caller: Address): Promise<boolean> {
    console.log("\n=== 检查授权调用者状态 ===");
    console.log("调用者地址:", caller);

    try {
      const isAuthorized = await this.delegateContract.read.authorizedCallers([caller]) as boolean;
      console.log("是否授权:", isAuthorized);
      return isAuthorized;
    } catch (error) {
      console.error("检查授权状态失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 5. 紧急停止和提取
   * ===========================================
   */

  /**
   * 设置暂停状态
   */
  async setPaused(paused: boolean) {
    console.log("\n=== 设置暂停状态 ===");
    console.log("暂停状态:", paused);

    try {
      const txHash = await this.delegateContract.write.setPaused([paused]);
      console.log("设置暂停状态已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("设置暂停状态确认成功");

      return receipt;
    } catch (error) {
      console.error("设置暂停状态失败:", error);
      throw error;
    }
  }

  /**
   * 紧急提取代币
   */
  async emergencyWithdraw(token: Address, to: Address, amount: bigint) {
    console.log("\n=== 紧急提取代币 ===");
    console.log("代币地址:", token);
    console.log("接收地址:", to);
    console.log("提取数量:", formatUnits(amount, 18));

    try {
      const txHash = await this.delegateContract.write.emergencyWithdraw([token, to, amount]);
      console.log("紧急提取已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("紧急提取确认成功");

      return receipt;
    } catch (error) {
      console.error("紧急提取失败:", error);
      throw error;
    }
  }

  /**
   * 紧急提取 ETH
   */
  async emergencyWithdrawETH(to: Address, amount: bigint) {
    console.log("\n=== 紧急提取 ETH ===");
    console.log("接收地址:", to);
    console.log("提取数量:", formatEther(amount), "ETH");

    try {
      const txHash = await this.delegateContract.write.emergencyWithdrawETH([to, amount]);
      console.log("紧急提取 ETH 已提交，哈希:", txHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("紧急提取 ETH 确认成功");

      return receipt;
    } catch (error) {
      console.error("紧急提取 ETH 失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 6. 查询功能
   * ===========================================
   */

  /**
   * 获取代币余额
   */
  async getTokenBalance(token: Address): Promise<bigint> {
    console.log("\n=== 查询代币余额 ===");
    console.log("代币地址:", token);

    try {
      const balance = await this.delegateContract.read.getTokenBalance([token]) as bigint;
      console.log("代币余额:", formatUnits(balance, 18));
      return balance;
    } catch (error) {
      console.error("查询代币余额失败:", error);
      throw error;
    }
  }

  /**
   * 获取 ETH 余额
   */
  async getETHBalance(): Promise<bigint> {
    console.log("\n=== 查询 ETH 余额 ===");

    try {
      const balance = await this.delegateContract.read.getETHBalance() as bigint;
      console.log("ETH 余额:", formatEther(balance), "ETH");
      return balance;
    } catch (error) {
      console.error("查询 ETH 余额失败:", error);
      throw error;
    }
  }

  /**
   * 获取代币授权额度
   */
  async getAllowance(token: Address, spender: Address): Promise<bigint> {
    console.log("\n=== 查询代币授权额度 ===");
    console.log("代币地址:", token);
    console.log("支出者地址:", spender);

    try {
      const allowance = await this.delegateContract.read.getAllowance([token, spender]) as bigint;
      console.log("授权额度:", formatUnits(allowance, 18));
      return allowance;
    } catch (error) {
      console.error("查询授权额度失败:", error);
      throw error;
    }
  }

  /**
   * 获取合约所有者
   */
  async getOwner(): Promise<Address> {
    console.log("\n=== 查询合约所有者 ===");

    try {
      const owner = await this.delegateContract.read.owner() as Address;
      console.log("合约所有者:", owner);
      return owner;
    } catch (error) {
      console.error("查询合约所有者失败:", error);
      throw error;
    }
  }

  /**
   * 获取暂停状态
   */
  async isPaused(): Promise<boolean> {
    console.log("\n=== 查询暂停状态 ===");

    try {
      const paused = await this.delegateContract.read.paused() as boolean;
      console.log("是否暂停:", paused);
      return paused;
    } catch (error) {
      console.error("查询暂停状态失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 7. 工具方法
   * ===========================================
   */

  /**
   * 构建函数调用数据
   */
  buildCallData(contractAbi: any[], functionName: string, args: any[]): `0x${string}` {
    try {
      const callData = encodeFunctionData({
        abi: contractAbi,
        functionName,
        args,
      });
      console.log(`构建 ${functionName} 调用数据:`, callData);
      return callData;
    } catch (error) {
      console.error("构建调用数据失败:", error);
      throw error;
    }
  }

  /**
   * 获取当前账户地址
   */
  getCurrentAccount(): Address {
    return this.account;
  }
}

export { DelegateClient };