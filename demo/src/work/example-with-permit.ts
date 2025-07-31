/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-31 15:35:00
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-31 15:35:00
 * @FilePath: /web3-test-front/demo/src/work/example-with-permit.ts
 * @Description: 使用支持 permit 的 Token 的完整示例
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { 
  toHex, 
  encodePacked, 
  keccak256, 
  encodeFunctionData, 
  getContract,
  createPublicClient,
  http,
  signTypedData
} from 'viem';
import { MerkleTree } from "merkletreejs";
import { privateClient } from './private-client'
import { sepolia } from 'viem/chains'
import AirdopMerkleNFTMarketABI from '../abis/AirdopMerkleNFTMarket.json'
import ERC20PermitABI from '../abis/ERC20Permit.json'

// 创建公共客户端
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.QUICKNODE_ENDPOINT),
})

// 合约地址配置
const CONTRACT_ADDRESSES = {
  AIRDROP_MERKLE_NFT_MARKET: "0x...", // 替换为实际的合约地址
  TOKEN: "0x...", // 替换为支持 permit 的 Token 合约地址
  NFT: "0x...", // 替换为实际的 NFT 合约地址
}

// 测试用的 listingId
const LISTING_ID = "test-listing-1";

// 白名单用户
const users = [
  { address: "0xD08c8e6d78a1f64B1796d6DC3137B19665cb6F1F", amount: BigInt(10) },
  { address: "0xb7D15753D3F76e7C892B63db6b4729f700C01298", amount: BigInt(15) },
  { address: "0xf69Ca530Cd4849e3d1329FBEC06787a96a3f9A68", amount: BigInt(20) },
  { address: "0xa8532aAa27E9f7c3a96d754674c99F1E2f824800", amount: BigInt(30) },
];

// 生成 permit 签名
async function generatePermitSignature(
  tokenAddress: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint
) {
  const tokenContract = getContract({
    address: tokenAddress,
    abi: ERC20PermitABI,
    client: publicClient,
  });

  // 获取 nonce
  const nonce = await tokenContract.read.nonces([owner]) as bigint;
  
  // 获取 DOMAIN_SEPARATOR
  const domainSeparator = await tokenContract.read.DOMAIN_SEPARATOR() as `0x${string}`;
  
  // 获取 PERMIT_TYPEHASH
  const permitTypehash = await tokenContract.read.PERMIT_TYPEHASH() as `0x${string}`;

  // 构建 permit 数据
  const permitData = {
    domain: {
      name: await tokenContract.read.name(),
      version: '1',
      chainId: sepolia.id,
      verifyingContract: tokenAddress,
    },
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Permit',
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };

  // 签名
  const signature = await privateClient.signTypedData(permitData);
  
  // 解析签名
  const { v, r, s } = parseSignature(signature);
  
  return { v, r, s, nonce };
}

// 解析签名
function parseSignature(signature: `0x${string}`) {
  const r = signature.slice(0, 66) as `0x${string}`;
  const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
  const v = parseInt(signature.slice(130, 132), 16);
  
  return { v, r, s };
}

// 使用 permit 的完整示例
async function executePermitAndClaimExample() {
  const account = privateClient.account;
  if (!account) {
    throw new Error("No account found");
  }

  // 1. 构建 Merkle 树
  console.log("=== 构建 Merkle 树 ===");
  const elements = users.map((x) =>
    keccak256(encodePacked(["address", "uint256"], [x.address as `0x${string}`, x.amount]))
  );

  const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
  const root = merkleTree.getHexRoot();
  console.log("Merkle Root:", root);

  // 2. 选择测试用户
  const testUser = users[3]; // 第4个用户
  const leaf = elements[3];
  const proof = merkleTree.getHexProof(leaf);
  console.log("Merkle Proof:", proof);

  // 3. 获取合约实例
  const marketContract = getContract({
    address: CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`,
    abi: AirdopMerkleNFTMarketABI,
    client: privateClient,
  });

  const tokenContract = getContract({
    address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
    abi: ERC20PermitABI,
    client: privateClient,
  });

  try {
    // 4. 验证白名单
    console.log("\n=== 验证白名单 ===");
    const isWhitelisted = await marketContract.read.verifyMerkleProof([
      testUser.address as `0x${string}`,
      testUser.amount,
      proof.map(p => p as `0x${string}`)
    ]);
    console.log("用户在白名单中:", isWhitelisted);

    if (!isWhitelisted) {
      throw new Error("用户不在白名单中");
    }

    // 5. 获取用户已领取数量
    const claimedAmount = await marketContract.read.getClaimedAmount([testUser.address as `0x${string}`]) as bigint;
    console.log("已领取数量:", claimedAmount.toString());

    const remainingAmount = testUser.amount - claimedAmount;
    if (remainingAmount <= 0) {
      console.log("用户已领取完所有额度");
      return;
    }

    // 6. 获取 listing 信息
    const listing = await marketContract.read.listings([LISTING_ID]) as any;
    const originalPrice = listing.price as bigint;
    const discountedPrice = await marketContract.read.calculateDiscountedPrice([originalPrice]) as bigint;
    
    console.log("原价:", originalPrice.toString());
    console.log("折扣价:", discountedPrice.toString());

    // 7. 检查余额
    const tokenBalance = await tokenContract.read.balanceOf([account.address]) as bigint;
    console.log("用户 Token 余额:", tokenBalance.toString());

    if (tokenBalance < discountedPrice) {
      throw new Error("Token 余额不足");
    }

    // 8. 生成 permit 签名
    console.log("\n=== 生成 Permit 签名 ===");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1小时后过期
    
    const { v, r, s, nonce } = await generatePermitSignature(
      CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
      account.address,
      CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`,
      discountedPrice,
      deadline
    );

    console.log("Permit 签名参数:");
    console.log("- v:", v);
    console.log("- r:", r);
    console.log("- s:", s);
    console.log("- nonce:", nonce.toString());
    console.log("- deadline:", deadline.toString());

    // 9. 构建 multicall 数据
    console.log("\n=== 构建 Multicall 数据 ===");
    
    const permitData = encodeFunctionData({
      abi: AirdopMerkleNFTMarketABI,
      functionName: 'permitPrePay',
      args: [
        account.address, // owner
        CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`, // spender
        discountedPrice, // value
        deadline, // deadline
        v, // v
        r, // r
        s // s
      ]
    });

    const claimData = encodeFunctionData({
      abi: AirdopMerkleNFTMarketABI,
      functionName: 'claimNFT',
      args: [
        LISTING_ID,
        remainingAmount,
        proof.map(p => p as `0x${string}`)
      ]
    });

    console.log("Permit 数据:", permitData);
    console.log("Claim 数据:", claimData);

    // 10. 执行 multicall
    console.log("\n=== 执行 Multicall ===");
    const multicallTx = await marketContract.write.multicall([[permitData, claimData]]);
    console.log("Multicall 交易哈希:", multicallTx);

    // 11. 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({ hash: multicallTx });
    console.log("交易已确认");
    console.log("交易收据:", receipt);

    console.log("🎉 交易成功完成！");
    console.log("用户已成功使用 permit 方式购买 NFT");

  } catch (error) {
    console.error("❌ 执行失败:", error);
  }
}

// 测试 permit 签名生成
async function testPermitSignature() {
  console.log("=== 测试 Permit 签名生成 ===");
  
  const account = privateClient.account;
  if (!account) {
    throw new Error("No account found");
  }

  const testValue = BigInt(1000000000000000000); // 1 ETH
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

  try {
    const { v, r, s, nonce } = await generatePermitSignature(
      CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
      account.address,
      CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`,
      testValue,
      deadline
    );

    console.log("✅ Permit 签名生成成功");
    console.log("签名参数:");
    console.log("- v:", v);
    console.log("- r:", r);
    console.log("- s:", s);
    console.log("- nonce:", nonce.toString());
    console.log("- deadline:", deadline.toString());

  } catch (error) {
    console.error("❌ Permit 签名生成失败:", error);
  }
}

// 主函数
async function main() {
  console.log("开始执行 Permit + ClaimNFT 示例...\n");

  try {
    // 先测试 permit 签名生成
    await testPermitSignature();
    
    // 然后执行完整示例
    await executePermitAndClaimExample();
    
  } catch (error) {
    console.error("执行失败:", error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

export { 
  executePermitAndClaimExample, 
  testPermitSignature, 
  generatePermitSignature,
  parseSignature 
}; 