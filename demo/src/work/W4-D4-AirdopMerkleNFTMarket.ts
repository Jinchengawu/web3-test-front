/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-31 14:26:33
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-08-01 00:55:22
 * @FilePath: /web3-test-front/demo/src/work/W4-D4-AirdopMerkleNFTMarket.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { toHex, encodePacked, keccak256, encodeFunctionData, parseEther, getContract, createPublicClient, http } from 'viem';
import { MerkleTree } from "merkletreejs";
import { privateClient } from './private-client'
import { sepolia } from 'viem/chains'
import AirdopMerkleNFTMarketABI from '../abis/AirdopMerkleNFTMarket.json'
import MyERC20ABI from '../abis/MyERC20.json'

// 创建公共客户端用于等待交易收据
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.QUICKNODE_ENDPOINT),
})

const users = [
  { address: "0xD08c8e6d78a1f64B1796d6DC3137B19665cb6F1F", amount: BigInt(10) },
  { address: "0xb7D15753D3F76e7C892B63db6b4729f700C01298", amount: BigInt(15) },
  { address: "0xf69Ca530Cd4849e3d1329FBEC06787a96a3f9A68", amount: BigInt(20) },
  { address: "0xa8532aAa27E9f7c3a96d754674c99F1E2f824800", amount: BigInt(30) },
];

// 合约地址配置
const CONTRACT_ADDRESSES = {
  AIRDROP_MERKLE_NFT_MARKET: "0xb628A80c04e7DDbe9fA39AbF9121767C24B8b0Da", // 替换为实际的合约地址
  TOKEN: "0x28E9F6eF779E601E5be0dc26e806DF4694CD41C1", // 替换为实际的 Token 合约地址
  NFT: "0x862E676F73C20e3fb374B06a76b2d5DE3F8317b7", // 替换为实际的 NFT 合约地址
}

// 测试用的 listingId
const LISTING_ID = "test-listing-1";

async function main() {
  // 构建 Merkle 树
  const elements = users.map((x) =>
    keccak256(encodePacked(["address", "uint256"], [x.address as `0x${string}`, x.amount]))
  );

  const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
  const root = merkleTree.getHexRoot();
  console.log("Merkle Root:", root);

  // 选择测试用户（第4个用户）
  const testUser = users[3];
  const leaf = elements[3];
  const proof = merkleTree.getHexProof(leaf);
  console.log("Merkle Proof:", proof);

  // 验证 Merkle 证明
  const isValid = merkleTree.verify(proof, leaf, root);
  console.log("Merkle Proof Valid:", isValid);

  // 获取合约实例
  const marketContract = getContract({
    address: CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`,
    abi: AirdopMerkleNFTMarketABI,
    client: privateClient,
  });

  const tokenContract = getContract({
    address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
    abi: MyERC20ABI,
    client: privateClient,
  });

  // 获取当前账户
  const account = privateClient.account;
  if (!account) {
    throw new Error("No account found");
  }

  try {
    // 1. 验证用户是否在白名单中
    console.log("\n=== 验证白名单 ===");
    const isWhitelisted = await marketContract.read.verifyMerkleProof([
      testUser.address as `0x${string}`,
      testUser.amount,
      proof
    ]);
    console.log("用户在白名单中:", isWhitelisted);

    // 2. 获取用户已领取的数量
    const claimedAmount = await marketContract.read.getClaimedAmount([testUser.address as `0x${string}`]) as bigint;
    console.log("已领取数量:", claimedAmount.toString());

    // 3. 计算可领取数量
    const remainingAmount = testUser.amount - claimedAmount;
    console.log("可领取数量:", remainingAmount.toString());

    if (remainingAmount <= 0) {
      console.log("用户已领取完所有额度");
      return;
    }

    // 4. 获取 listing 信息
    console.log("\n=== 获取 Listing 信息 ===");
    const listing = await marketContract.read.listings([LISTING_ID]) as any;
    console.log("Listing 信息:", listing);

    // 5. 计算折扣价格
    const originalPrice = listing.price as bigint;
    const discountedPrice = await marketContract.read.calculateDiscountedPrice([originalPrice]) as bigint;
    console.log("原价:", originalPrice.toString());
    console.log("折扣价:", discountedPrice.toString());

    // 6. 检查用户 Token 余额
    const tokenBalance = await tokenContract.read.balanceOf([account.address]) as bigint;
    console.log("用户 Token 余额:", tokenBalance.toString());

    if (tokenBalance < discountedPrice) {
      console.log("Token 余额不足");
      return;
    }

    // 7. 执行 multicall：permitPrePay + claimNFT
    console.log("\n=== 执行 Multicall ===");
    
    // 注意：由于 MyERC20 没有 permit 功能，我们需要使用 approve
    // 在实际场景中，应该使用支持 permit 的 Token 合约
    
    // 方法1：使用 approve + claimNFT
    await executeApproveAndClaim(discountedPrice, remainingAmount, proof);
    
    // 方法2：如果有支持 permit 的 Token，可以使用以下代码
    // await executePermitAndClaim(discountedPrice, remainingAmount, proof);

  } catch (error) {
    console.error("执行失败:", error);
  }
}

// 方法1：使用 approve + claimNFT
async function executeApproveAndClaim(
  discountedPrice: bigint,
  maxAmount: bigint,
  proof: `0x${string}`[]
) {
  const marketContract = getContract({
    address: CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`,
    abi: AirdopMerkleNFTMarketABI,
    client: privateClient,
  });

  const tokenContract = getContract({
    address: CONTRACT_ADDRESSES.TOKEN as `0x${string}`,
    abi: MyERC20ABI,
    client: privateClient,
  });

  const account = privateClient.account;
  if (!account) throw new Error("No account found");

  console.log("执行 approve...");
  
  // 先执行 approve
  const approveTx = await tokenContract.write.approve([
    CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`,
    discountedPrice
  ]);
  console.log("Approve 交易哈希:", approveTx);

  // 等待 approve 交易确认
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
  console.log("Approve 交易已确认");

  // 执行 claimNFT
  console.log("执行 claimNFT...");
  const claimTx = await marketContract.write.claimNFT([
    LISTING_ID,
    maxAmount,
    proof.map(p => p as `0x${string}`)
  ]);
  console.log("ClaimNFT 交易哈希:", claimTx);

  // 等待 claimNFT 交易确认
  const receipt = await publicClient.waitForTransactionReceipt({ hash: claimTx });
  console.log("ClaimNFT 交易已确认");
  console.log("交易收据:", receipt);

  return { approveTx, claimTx };
}

// 方法2：使用 permit + claimNFT（需要支持 permit 的 Token）
async function executePermitAndClaim(
  discountedPrice: bigint,
  maxAmount: bigint,
  proof: `0x${string}`[]
) {
  const marketContract = getContract({
    address: CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`,
    abi: AirdopMerkleNFTMarketABI,
    client: privateClient,
  });

  const account = privateClient.account;
  if (!account) throw new Error("No account found");

  // 准备 multicall 数据
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1小时后过期
  
  // 注意：这里需要根据实际的 Token 合约来生成 permit 签名
  // 由于 MyERC20 不支持 permit，这里只是示例代码结构
  
  const permitData = encodeFunctionData({
    abi: AirdopMerkleNFTMarketABI,
    functionName: 'permitPrePay',
    args: [
      account.address, // owner
      CONTRACT_ADDRESSES.AIRDROP_MERKLE_NFT_MARKET as `0x${string}`, // spender
      discountedPrice, // value
      deadline, // deadline
      27, // v (需要根据实际签名计算)
      '0x0000000000000000000000000000000000000000000000000000000000000000', // r (需要根据实际签名计算)
      '0x0000000000000000000000000000000000000000000000000000000000000000' // s (需要根据实际签名计算)
    ]
  });

  const claimData = encodeFunctionData({
    abi: AirdopMerkleNFTMarketABI,
    functionName: 'claimNFT',
    args: [LISTING_ID, maxAmount, proof]
  });

  console.log("执行 multicall...");
  const multicallTx = await marketContract.write.multicall([[permitData, claimData]]);
  console.log("Multicall 交易哈希:", multicallTx);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: multicallTx });
  console.log("Multicall 交易已确认");
  console.log("交易收据:", receipt);

  return multicallTx;
}

// 测试函数
async function testMerkleTree() {
  console.log("=== 测试 Merkle 树 ===");
  
  const elements = users.map((x) =>
    keccak256(encodePacked(["address", "uint256"], [x.address as `0x${string}`, x.amount]))
  );

  const merkleTree = new MerkleTree(elements, keccak256, { sort: true });
  const root = merkleTree.getHexRoot();
  
  console.log("Merkle Root:", root);
  console.log("Elements:", elements.map(e => e.toString()));

  // 测试每个用户的证明
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const leaf = elements[i];
    const proof = merkleTree.getHexProof(leaf);
    const isValid = merkleTree.verify(proof, leaf, root);
    
    console.log(`用户 ${i + 1}: ${user.address}`);
    console.log(`  数量: ${user.amount}`);
    console.log(`  证明: ${proof}`);
    console.log(`  有效: ${isValid}`);
    console.log("---");
  }
}

// 主函数
async function run() {
  try {
    // 先测试 Merkle 树
    await testMerkleTree();
    
    // 然后执行主逻辑
    await main();
  } catch (error) {
    console.error("运行失败:", error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  run();
}

export { main, testMerkleTree, executeApproveAndClaim, executePermitAndClaim };

