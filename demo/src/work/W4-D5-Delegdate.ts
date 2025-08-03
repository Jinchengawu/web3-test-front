/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-08-03 21:19:07
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-08-03 21:21:29
 * @FilePath: /web3-test-front/demo/src/work/W4-D5-Delegdate.ts
 * @Description: Delegate 合约客户端实现 - 基于 EIP-7702 的账户抽象实现
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { 
  getContract, 
  createPublicClient, 
  createWalletClient,
  http, 
  parseEther, 
  formatEther, 
  encodeFunctionData,
  parseUnits,
  formatUnits,
  Address,
  zeroAddress
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
 * Delegate 合约客户端类 - 基于 EIP-7702 的账户抽象实现
 * 
 * 功能特性：
 * 1. 基于 EIP-7702 的账户抽象，让 EOA 临时获得智能合约能力
 * 2. 支持批量执行（multicall）
 * 3. 支持代理调用（delegatecall）
 * 4. 支持与 TokenBank 的授权和存款操作
 * 5. 支持紧急停止功能
 * 6. 自动管理 EOA 授权状态
 */
class DelegateClient {
  private delegateContract: any;
  private tokenBankContract: any;
  private tokenContract: any;
  private account: Address;
  private walletClient: any;
  private currentAuthorization: any = null;
  private isEOAAuthorized: boolean = false;

  constructor() {
    // 获取当前账户
    this.account = privateClient.account?.address as Address;
    if (!this.account) {
      throw new Error("No account found in privateClient");
    }

    // 创建钱包客户端用于 EIP-7702 操作
    this.walletClient = createWalletClient({
      account: privateClient.account,
      chain: sepolia,
      transport: http(process.env.QUICKNODE_ENDPOINT),
    });

    // 初始化合约实例（用于构建 calldata）
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

    console.log("🚀 DelegateClient 初始化完成 (EIP-7702 模式)");
    console.log("EOA 地址:", this.account);
    console.log("Delegate 合约地址:", CONTRACT_ADDRESSES.DELEGATE);
  }

  /**
   * ===========================================
   * 0. EIP-7702 核心功能
   * ===========================================
   */

  /**
   * 检查 EOA 是否已有代码
   */
  async checkEOACode(): Promise<string> {
    console.log("\n=== 检查 EOA 代码状态 ===");
    console.log("EOA 地址:", this.account);

    try {
      const code = await publicClient.getBytecode({ address: this.account });
      const hasCode = !!(code && code.length > 2); // "0x" 不算有代码
      
      console.log("链上代码:", code || "无");
      console.log("是否有代码:", hasCode);
      
      this.isEOAAuthorized = hasCode;
      return code || "0x";
    } catch (error) {
      console.error("检查 EOA 代码失败:", error);
      throw error;
    }
  }

  /**
   * 创建 EIP-7702 授权
   */
  async createAuthorization() {
    console.log("\n=== 创建 EIP-7702 授权 ===");
    console.log("授权合约地址:", CONTRACT_ADDRESSES.DELEGATE);

    try {
      const authorization = await this.walletClient.signAuthorization({
        contractAddress: CONTRACT_ADDRESSES.DELEGATE as Address,
        executor: 'self',
      });

      this.currentAuthorization = authorization;
      console.log("✅ EIP-7702 授权创建成功");
      console.log("授权详情:", authorization);
      
      return authorization;
    } catch (error) {
      console.error("创建 EIP-7702 授权失败:", error);
      throw error;
    }
  }

  /**
   * 取消 EIP-7702 授权
   */
  async revokeAuthorization() {
    console.log("\n=== 取消 EIP-7702 授权 ===");

    try {
      const cancelAuthorization = await this.walletClient.signAuthorization({
        contractAddress: zeroAddress,
        executor: 'self',
      });

      const hash = await this.walletClient.sendTransaction({
        authorizationList: [cancelAuthorization],
        to: zeroAddress,
      });

      console.log("取消授权交易已提交，哈希:", hash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("取消授权确认成功，区块号:", receipt.blockNumber);

      this.currentAuthorization = null;
      this.isEOAAuthorized = false;

      return receipt;
    } catch (error) {
      console.error("取消 EIP-7702 授权失败:", error);
      throw error;
    }
  }

  /**
   * 通过 EIP-7702 执行合约函数
   */
  async executeViaEIP7702(functionName: string, args: any[] = [], value: bigint = 0n) {
    console.log("\n=== 通过 EIP-7702 执行合约函数 ===");
    console.log("函数名:", functionName);
    console.log("参数:", args);
    console.log("附带 ETH:", value > 0n ? formatEther(value) + " ETH" : "0");

    try {
      // 1. 检查 EOA 代码状态
      await this.checkEOACode();

      // 2. 如果 EOA 已有代码，直接调用
      if (this.isEOAAuthorized) {
        console.log("📞 EOA 已授权，直接调用合约函数");
        
        const callData = encodeFunctionData({
          abi: DelegateABI,
          functionName,
          args,
        });

        const hash = await this.walletClient.sendTransaction({
          to: this.account,
          data: callData,
          value,
        });

        console.log("直接调用交易已提交，哈希:", hash);
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("直接调用确认成功，区块号:", receipt.blockNumber);
        
        return receipt;
      }

      // 3. 如果 EOA 没有代码，使用 EIP-7702 授权
      console.log("🔐 EOA 未授权，使用 EIP-7702 授权执行");
      
      if (!this.currentAuthorization) {
        await this.createAuthorization();
      }

      const hash = await this.walletClient.writeContract({
        abi: DelegateABI,
        address: this.account, // 向 EOA 地址发送交易
        functionName,
        args,
        authorizationList: [this.currentAuthorization],
        value,
      });

      console.log("EIP-7702 交易已提交，哈希:", hash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("EIP-7702 交易确认成功，区块号:", receipt.blockNumber);
      console.log("Gas 使用量:", receipt.gasUsed);

      // 更新状态
      this.isEOAAuthorized = true;

      return receipt;
    } catch (error) {
      console.error("EIP-7702 执行失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 1. 授权和存款操作
   * ===========================================
   */

  /**
   * 单个代币授权并存款 (通过 EIP-7702)
   */
  async approveAndDeposit(tokenAddress: Address, tokenBankAddress: Address, amount: bigint) {
    console.log("\n=== 执行单个代币授权并存款 (EIP-7702) ===");
    console.log("代币地址:", tokenAddress);
    console.log("TokenBank地址:", tokenBankAddress);
    console.log("存款数量:", formatUnits(amount, 18));

    try {
      return await this.executeViaEIP7702('approveAndDeposit', [
        tokenAddress,
        tokenBankAddress,
        amount
      ]);
    } catch (error) {
      console.error("EIP-7702 授权并存款失败:", error);
      throw error;
    }
  }

  /**
   * 批量代币授权并存款 (通过 EIP-7702)
   */
  async batchApproveAndDeposit(tokens: Address[], tokenBanks: Address[], amounts: bigint[]) {
    console.log("\n=== 执行批量代币授权并存款 (EIP-7702) ===");
    console.log("代币数量:", tokens.length);
    console.log("代币地址:", tokens);
    console.log("TokenBank地址:", tokenBanks);
    console.log("存款数量:", amounts.map(amt => formatUnits(amt, 18)));

    if (tokens.length !== tokenBanks.length || tokens.length !== amounts.length) {
      throw new Error("数组长度不一致");
    }

    try {
      return await this.executeViaEIP7702('batchApproveAndDeposit', [
        tokens,
        tokenBanks,
        amounts
      ]);
    } catch (error) {
      console.error("EIP-7702 批量授权并存款失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 2. 批量调用功能
   * ===========================================
   */

  /**
   * 普通批量调用 (通过 EIP-7702)
   */
  async multicall(calls: { target: Address; callData: `0x${string}` }[]) {
    console.log("\n=== 执行普通批量调用 (EIP-7702) ===");
    console.log("调用数量:", calls.length);

    try {
      return await this.executeViaEIP7702('multicall', [calls]);
    } catch (error) {
      console.error("EIP-7702 批量调用失败:", error);
      throw error;
    }
  }

  /**
   * 批量代理调用 (通过 EIP-7702)
   */
  async multicallDelegate(calls: { target: Address; callData: `0x${string}` }[]) {
    console.log("\n=== 执行批量代理调用 (EIP-7702) ===");
    console.log("调用数量:", calls.length);

    try {
      return await this.executeViaEIP7702('multicallDelegate', [calls]);
    } catch (error) {
      console.error("EIP-7702 批量代理调用失败:", error);
      throw error;
    }
  }

  /**
   * 带价值的批量调用 (通过 EIP-7702)
   */
  async multicallWithValue(calls: { target: Address; value: bigint; callData: `0x${string}` }[]) {
    console.log("\n=== 执行带价值的批量调用 (EIP-7702) ===");
    console.log("调用数量:", calls.length);

    const totalValue = calls.reduce((sum, call) => sum + call.value, 0n);
    console.log("总 ETH 价值:", formatEther(totalValue), "ETH");
    
    try {
      return await this.executeViaEIP7702('multicallWithValue', [calls], totalValue);
    } catch (error) {
      console.error("EIP-7702 带价值批量调用失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 3. 代理调用
   * ===========================================
   */

  /**
   * 单个代理调用 (通过 EIP-7702)
   */
  async delegateCall(target: Address, data: `0x${string}`) {
    console.log("\n=== 执行代理调用 (EIP-7702) ===");
    console.log("目标地址:", target);
    console.log("调用数据:", data);

    try {
      return await this.executeViaEIP7702('delegateCall', [target, data]);
    } catch (error) {
      console.error("EIP-7702 代理调用失败:", error);
      throw error;
    }
  }

  /**
   * ===========================================
   * 4. 权限管理
   * ===========================================
   */

  /**
   * 添加授权调用者 (通过 EIP-7702)
   */
  async addAuthorizedCaller(caller: Address) {
    console.log("\n=== 添加授权调用者 (EIP-7702) ===");
    console.log("调用者地址:", caller);

    try {
      return await this.executeViaEIP7702('addAuthorizedCaller', [caller]);
    } catch (error) {
      console.error("EIP-7702 添加授权调用者失败:", error);
      throw error;
    }
  }

  /**
   * 移除授权调用者 (通过 EIP-7702)
   */
  async removeAuthorizedCaller(caller: Address) {
    console.log("\n=== 移除授权调用者 (EIP-7702) ===");
    console.log("调用者地址:", caller);

    try {
      return await this.executeViaEIP7702('removeAuthorizedCaller', [caller]);
    } catch (error) {
      console.error("EIP-7702 移除授权调用者失败:", error);
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
   * 设置暂停状态 (通过 EIP-7702)
   */
  async setPaused(paused: boolean) {
    console.log("\n=== 设置暂停状态 (EIP-7702) ===");
    console.log("暂停状态:", paused);

    try {
      return await this.executeViaEIP7702('setPaused', [paused]);
    } catch (error) {
      console.error("EIP-7702 设置暂停状态失败:", error);
      throw error;
    }
  }

  /**
   * 紧急提取代币 (通过 EIP-7702)
   */
  async emergencyWithdraw(token: Address, to: Address, amount: bigint) {
    console.log("\n=== 紧急提取代币 (EIP-7702) ===");
    console.log("代币地址:", token);
    console.log("接收地址:", to);
    console.log("提取数量:", formatUnits(amount, 18));

    try {
      return await this.executeViaEIP7702('emergencyWithdraw', [token, to, amount]);
    } catch (error) {
      console.error("EIP-7702 紧急提取失败:", error);
      throw error;
    }
  }

  /**
   * 紧急提取 ETH (通过 EIP-7702)
   */
  async emergencyWithdrawETH(to: Address, amount: bigint) {
    console.log("\n=== 紧急提取 ETH (EIP-7702) ===");
    console.log("接收地址:", to);
    console.log("提取数量:", formatEther(amount), "ETH");

    try {
      return await this.executeViaEIP7702('emergencyWithdrawETH', [to, amount]);
    } catch (error) {
      console.error("EIP-7702 紧急提取 ETH 失败:", error);
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

  /**
   * ===========================================
   * 8. EIP-7702 状态管理
   * ===========================================
   */

  /**
   * 获取当前 EIP-7702 授权状态
   */
  getEIP7702Status() {
    return {
      isEOAAuthorized: this.isEOAAuthorized,
      hasCurrentAuthorization: !!this.currentAuthorization,
      delegateContractAddress: CONTRACT_ADDRESSES.DELEGATE,
      eoaAddress: this.account,
    };
  }

  /**
   * 获取当前授权信息
   */
  getCurrentAuthorization() {
    return this.currentAuthorization;
  }

  /**
   * 强制刷新 EOA 授权状态
   */
  async refreshEOAStatus() {
    await this.checkEOACode();
    return this.isEOAAuthorized;
  }

  /**
   * 一键初始化 EIP-7702 授权（如果需要）
   */
  async ensureEIP7702Authorization() {
    console.log("\n=== 确保 EIP-7702 授权 ===");
    
    try {
      await this.checkEOACode();
      
      if (!this.isEOAAuthorized && !this.currentAuthorization) {
        console.log("🔐 初始化 EIP-7702 授权...");
        await this.createAuthorization();
        console.log("✅ EIP-7702 授权初始化完成");
      } else if (this.isEOAAuthorized) {
        console.log("✅ EOA 已授权，无需初始化");
      } else {
        console.log("✅ 授权对象已存在，无需重新创建");
      }

      return this.getEIP7702Status();
    } catch (error) {
      console.error("确保 EIP-7702 授权失败:", error);
      throw error;
    }
  }

  /**
   * 清理所有 EIP-7702 状态
   */
  async cleanupEIP7702() {
    console.log("\n=== 清理 EIP-7702 状态 ===");
    
    try {
      if (this.isEOAAuthorized || this.currentAuthorization) {
        await this.revokeAuthorization();
      }
      
      this.currentAuthorization = null;
      this.isEOAAuthorized = false;
      
      console.log("✅ EIP-7702 状态清理完成");
      return this.getEIP7702Status();
    } catch (error) {
      console.error("清理 EIP-7702 状态失败:", error);
      throw error;
    }
  }
}

export { DelegateClient };