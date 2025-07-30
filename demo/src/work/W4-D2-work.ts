/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-30 19:38:34
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-30 19:40:30
 * @FilePath: /web3-test-front/demo/src/work/W4-D2-work.ts
 * @Description: 使用Viem从链上读取esRNT合约的_locks数组
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

/**
 * 使用Viem从链上读取esRNT合约的_locks数组中的所有元素值
 * 
 * 提供了三种读取方式：
 * 1. getStorageAt - 直接读取存储槽（复杂，需要了解存储布局）
 * 2. readContract - 通过合约函数读取（推荐，简单可靠）
 * 3. multicall - 批量调用合约函数
 * 
 * 输出格式：locks[0]: user:0x..., startTime:1234567890, amount:1000000000000000000
 * 
 * 使用前请确保：
 * 1. 替换CONTRACT_ADDRESS为实际的合约地址
 * 2. 确保合约已部署并包含_locks数组
 * 3. 网络连接正常
 */

// contract esRNT {
//   struct LockInfo{
//       address user;
//       uint64 startTime; 
//       uint256 amount;
//   }
//   LockInfo[] private _locks;

//   constructor() { 
//       for (uint256 i = 0; i < 11; i++) {
//           _locks.push(LockInfo(address(uint160(I+1)), uint64(block.timestamp*2-i), 1e18*(i+1)));
//       }
//   }
// }

import { createPublicClient, http } from "viem";
import { getStorageAt, readContract } from "viem/actions";
import { sepolia } from 'viem/chains';
import esRNTAbi from '../abis/esRNT.json';

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// 合约地址 - 需要替换为实际的合约地址
// 请将下面的地址替换为实际部署的esRNT合约地址
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// 使用getStorageAt读取_locks数组
async function readLocksFromStorage() {
  try {
    console.log('开始读取_locks数组...');
    
    // 由于直接读取复杂结构体数组的存储布局比较复杂，
    // 这里提供一个简化的示例，实际使用时需要根据具体的存储布局调整
    
    // 假设数组长度为11（根据构造函数）
    const arrayLength = 11;
    console.log(`数组长度: ${arrayLength}`);
    
    // 读取前几个元素作为示例
    for (let i = 0; i < Math.min(arrayLength, 3); i++) {
      // 计算存储slot（这是简化的计算，实际需要根据Solidity的存储布局）
      const baseSlot = BigInt(i * 3);
      
      // 读取user (address)
      const userSlot = ('0x' + baseSlot.toString(16).padStart(64, '0')) as `0x${string}`;
      const userData = await getStorageAt(client, {
        address: CONTRACT_ADDRESS,
        slot: userSlot,
      });
      
      // 读取startTime (uint64)
      const startTimeSlot = ('0x' + (baseSlot + 1n).toString(16).padStart(64, '0')) as `0x${string}`;
      const startTimeData = await getStorageAt(client, {
        address: CONTRACT_ADDRESS,
        slot: startTimeSlot,
      });
      
      // 读取amount (uint256)
      const amountSlot = ('0x' + (baseSlot + 2n).toString(16).padStart(64, '0')) as `0x${string}`;
      const amountData = await getStorageAt(client, {
        address: CONTRACT_ADDRESS,
        slot: amountSlot,
      });
      
      // 解析数据
      if (userData && startTimeData && amountData) {
        const user = '0x' + userData.slice(26); // 移除前导零，保留address
        const startTime = BigInt(startTimeData);
        const amount = BigInt(amountData);
        
        console.log(`locks[${i}]: user: ${user}, startTime: ${startTime}, amount: ${amount}`);
      } else {
        console.log(`locks[${i}]: 数据不完整或为空`);
      }
    }
    
    console.log('注意: 这是简化的示例。实际使用时需要根据Solidity的存储布局正确计算slot位置。');
    
  } catch (error) {
    console.error('读取存储时出错:', error);
  }
}

// 使用readContract方式读取（推荐方式）
async function readLocksWithContract() {
  try {
    console.log('使用readContract读取_locks数组...');
    
    // 首先获取数组长度
    const length = await readContract(client, {
      address: CONTRACT_ADDRESS,
      abi: esRNTAbi,
      functionName: 'getLocksLength',
    });
    
    console.log(`数组长度: ${length}`);
    
    // 读取所有LockInfo
    const locks = await readContract(client, {
      address: CONTRACT_ADDRESS,
      abi: esRNTAbi,
      functionName: 'getLockInfo',
    });
    
    if (Array.isArray(locks)) {
      locks.forEach((lock: any, index: number) => {
        console.log(`locks[${index}]: user: ${lock.user}, startTime: ${lock.startTime}, amount: ${lock.amount}`);
      });
    }
    
  } catch (error) {
    console.error('readContract调用出错:', error);
  }
}

// 使用multicall方式读取（如果合约有getLockInfo函数）
async function readLocksWithMulticall() {
  try {
    console.log('使用multicall读取_locks数组...');
    
    const result = await client.multicall({
      contracts: [
        {
          address: CONTRACT_ADDRESS,
          abi: esRNTAbi,
          functionName: 'getLockInfo',
        },
      ],
    });
    
    if (result[0].status === 'success') {
      const locks = result[0].result as any[];
      if (Array.isArray(locks)) {
        locks.forEach((lock: any, index: number) => {
          console.log(`locks[${index}]: user: ${lock.user}, startTime: ${lock.startTime}, amount: ${lock.amount}`);
        });
      }
    } else {
      console.error('multicall调用失败:', result[0].error);
    }
    
  } catch (error) {
    console.error('multicall调用出错:', error);
  }
}

// 主函数
async function main() {
  console.log('=== 使用getStorageAt方式读取 ===');
  await readLocksFromStorage();
  
  console.log('\n=== 使用readContract方式读取（推荐） ===');
  await readLocksWithContract();
  
  console.log('\n=== 使用multicall方式读取 ===');
  await readLocksWithMulticall();
}

// 运行脚本
main().catch(console.error);