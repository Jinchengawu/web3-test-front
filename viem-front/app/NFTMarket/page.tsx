'use client';
/**
 * 
 * 
 * 
  为 NFTMarket 项目添加前端，并接入 AppKit 进行前端登录，并实际操作使用 WalletConnect 进行登录（需要先安装手机端钱包）。

  并在 NFTMarket 前端添加上架操作，切换另一个账号后可使用 Token 进行购买 NFT。

  提交 github 仓库地址，请在仓库中包含 NFT 上架后的截图。
 * 
 * 
 */
import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitNetwork, useDisconnect } from '@reown/appkit/react';
import { useReadContract, useWriteContract } from 'wagmi';
import { 
  parseEther, 
  formatEther,
  type Address,
  createPublicClient,
  http
} from 'viem';
import { foundry } from 'wagmi/chains';
import TokenBankABI from '../contracts/TokenBank.json';
import ERC20ABI from '../contracts/ERC20.json';
import NFTMarketABI from '../contracts/NFTMarket.json';
import ERC721ABI from '../abi/ERC721_MARKET_ABI.json';
import UserProfile from './components/UserProfile';

// 合约地址 - 请根据实际部署的地址进行修改
const ERC20_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address;
const ERC721_NFT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address;
const NFT_MARKET_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address;
const TOKEN_BANK_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address;

interface NFTListing {
  seller: Address;
  price: bigint;
  isListed: boolean;
}

export default function NFTMarketPage() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending } = useWriteContract();

  // 创建公共客户端
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http()
  });

  // 状态管理
  const [tokenBalance, setTokenBalance] = useState<bigint>(BigInt(0));
  const [depositBalance, setDepositBalance] = useState<bigint>(BigInt(0));
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [userNFTs, setUserNFTs] = useState<number[]>([]);
  const [marketListings, setMarketListings] = useState<NFTListing[]>([]);
  const [amount, setAmount] = useState('');
  const [nftTokenId, setNftTokenId] = useState('');
  const [nftPrice, setNftPrice] = useState('');
  const [error, setError] = useState<string>('');

  // 读取合约数据
  const { data: tokenBal, refetch: refetchTokenBalance } = useReadContract({
    address: ERC20_TOKEN_ADDRESS,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: depositBal, refetch: refetchDepositBalance } = useReadContract({
    address: TOKEN_BANK_ADDRESS,
    abi: TokenBankABI,
    functionName: 'balances',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: allowanceAmount, refetch: refetchAllowance } = useReadContract({
    address: ERC20_TOKEN_ADDRESS,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, TOKEN_BANK_ADDRESS] : undefined,
    query: { enabled: !!address }
  });

  // 更新状态
  useEffect(() => {
    if (tokenBal !== undefined) setTokenBalance(tokenBal as bigint);
    if (depositBal !== undefined) setDepositBalance(depositBal as bigint);
    if (allowanceAmount !== undefined) setAllowance(allowanceAmount as bigint);
  }, [tokenBal, depositBal, allowanceAmount]);

  // 处理断开连接后的状态清理
  const handleDisconnectSuccess = () => {
    // 清空状态
    setTokenBalance(BigInt(0));
    setDepositBalance(BigInt(0));
    setAllowance(BigInt(0));
    setUserNFTs([]);
    setMarketListings([]);
    setAmount('');
    setNftTokenId('');
    setNftPrice('');
    setError('');
  };

  // 获取用户的 NFT
  const fetchUserNFTs = async () => {
    if (!address) return;
    
    try {
      const balance = await publicClient.readContract({
        address: ERC721_NFT_ADDRESS,
        abi: ERC721ABI.abi,
        functionName: 'balanceOf',
        args: [address]
      });
      
      const nfts: number[] = [];
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await publicClient.readContract({
          address: ERC721_NFT_ADDRESS,
          abi: ERC721ABI.abi,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(i)]
        });
        nfts.push(Number(tokenId));
      }
      setUserNFTs(nfts);
    } catch (error) {
      console.error('获取用户 NFT 失败:', error);
    }
  };

  // 获取市场列表
  const fetchMarketListings = async () => {
    try {
      const listings: NFTListing[] = [];
      // 这里应该遍历所有上架的 NFT，简化处理
      for (let i = 0; i < 10; i++) {
        try {
          const listing = await publicClient.readContract({
            address: NFT_MARKET_ADDRESS,
            abi: NFTMarketABI,
            functionName: 'listings',
            args: [BigInt(i)]
          });
          
          if (listing && (listing as any).isListed) {
            listings.push({
              seller: (listing as any).seller,
              price: (listing as any).price,
              isListed: (listing as any).isListed
            });
          }
        } catch (error) {
          // 如果读取失败，说明该 tokenId 不存在或未上架
          continue;
        }
      }
      setMarketListings(listings);
    } catch (error) {
      console.error('获取市场列表失败:', error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchUserNFTs();
      fetchMarketListings();
    }
  }, [address]);

  // 处理授权
  const handleApprove = async () => {
    if (!address || !amount) return;

    try {
      setError('');
      writeContract({
        address: ERC20_TOKEN_ADDRESS,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [TOKEN_BANK_ADDRESS, parseEther(amount)],
      });
    } catch (error) {
      console.error('授权错误:', error);
      setError('授权失败');
    }
  };

  // 处理存款
  const handleDeposit = async () => {
    if (!address || !amount) return;

    try {
      setError('');
      writeContract({
        address: TOKEN_BANK_ADDRESS,
        abi: TokenBankABI,
        functionName: 'deposit',
        args: [parseEther(amount)],
      });
    } catch (error) {
      console.error('存款错误:', error);
      setError('存款失败');
    }
  };

  // 处理取款
  const handleWithdraw = async () => {
    if (!address || !amount) return;

    try {
      setError('');
      writeContract({
        address: TOKEN_BANK_ADDRESS,
        abi: TokenBankABI,
        functionName: 'withdraw',
        args: [parseEther(amount)],
      });
    } catch (error) {
      console.error('取款错误:', error);
      setError('取款失败');
    }
  };

  // 上架 NFT
  const handleListNFT = async () => {
    if (!address || !nftTokenId || !nftPrice) return;

    try {
      setError('');
      // 首先授权 NFT 给市场合约
      writeContract({
        address: ERC721_NFT_ADDRESS,
        abi: ERC721ABI.abi,
        functionName: 'approve',
        args: [NFT_MARKET_ADDRESS, BigInt(nftTokenId)],
      });

      // 然后上架 NFT
      writeContract({
        address: NFT_MARKET_ADDRESS,
        abi: NFTMarketABI,
        functionName: 'listNFT',
        args: [BigInt(nftTokenId), parseEther(nftPrice)],
      });
    } catch (error) {
      console.error('上架 NFT 错误:', error);
      setError('上架 NFT 失败');
    }
  };

  // 购买 NFT
  const handleBuyNFT = async (tokenId: number) => {
    if (!address) return;

    try {
      setError('');
      writeContract({
        address: NFT_MARKET_ADDRESS,
        abi: NFTMarketABI,
        functionName: 'buyNFT',
        args: [BigInt(tokenId)],
      });
    } catch (error) {
      console.error('购买 NFT 错误:', error);
      setError('购买 NFT 失败');
    }
  };

  // 下架 NFT
  const handleUnlistNFT = async (tokenId: number) => {
    if (!address) return;

    try {
      setError('');
      writeContract({
        address: NFT_MARKET_ADDRESS,
        abi: NFTMarketABI,
        functionName: 'unlistNFT',
        args: [BigInt(tokenId)],
      });
    } catch (error) {
      console.error('下架 NFT 错误:', error);
      setError('下架 NFT 失败');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">NFTMarket</h1>
        <p className="text-xl mb-8">请先连接钱包</p>
        <appkit-button />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-6xl">
        {/* 顶部导航栏 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">NFTMarket</h1>
          <UserProfile onDisconnect={handleDisconnectSuccess} />
        </div>
        
        <div className="space-y-6">
          {/* 账户信息 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">账户信息</h2>
            <p className="mb-2">地址: {address}</p>
            <p className="mb-2">ERC20 代币余额: {formatEther(tokenBalance)} S6Token</p>
            <p className="mb-2">TokenBank 存款: {formatEther(depositBalance)} S6Token</p>
            <p className="mb-4">当前授权额度: {formatEther(allowance)} S6Token</p>
          </div>

          {/* 代币操作 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">代币操作</h2>
            <div className="space-y-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="输入金额"
                className="w-full p-2 border rounded"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleApprove}
                  disabled={isPending || !amount}
                  className="flex-1 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
                >
                  {isPending ? '授权中...' : '授权'}
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={isPending || !amount}
                  className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isPending ? '存款中...' : '存款'}
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isPending || !amount || parseEther(amount) > depositBalance}
                  className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isPending ? '取款中...' : '取款'}
                </button>
              </div>
            </div>
          </div>

          {/* 我的 NFT */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">我的 NFT</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userNFTs.map((tokenId) => (
                <div key={tokenId} className="border p-4 rounded">
                  <p className="font-semibold">Token ID: {tokenId}</p>
                  <button
                    onClick={() => {
                      setNftTokenId(tokenId.toString());
                      setNftPrice('');
                    }}
                    className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                  >
                    上架
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 上架 NFT */}
          {nftTokenId && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">上架 NFT (Token ID: {nftTokenId})</h2>
              <div className="space-y-4">
                <input
                  type="number"
                  value={nftPrice}
                  onChange={(e) => setNftPrice(e.target.value)}
                  placeholder="输入价格 (S6Token)"
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleListNFT}
                    disabled={isPending || !nftPrice}
                    className="flex-1 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
                  >
                    {isPending ? '上架中...' : '确认上架'}
                  </button>
                  <button
                    onClick={() => {
                      setNftTokenId('');
                      setNftPrice('');
                    }}
                    className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NFT 市场 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">NFT 市场</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketListings.map((listing, index) => (
                <div key={index} className="border p-4 rounded">
                  <p className="font-semibold">Token ID: {index}</p>
                  <p className="text-sm text-gray-600">卖家: {listing.seller}</p>
                  <p className="text-sm text-gray-600">价格: {formatEther(listing.price)} S6Token</p>
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => handleBuyNFT(index)}
                      disabled={isPending}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                      {isPending ? '购买中...' : '购买'}
                    </button>
                    {listing.seller === address && (
                      <button
                        onClick={() => handleUnlistNFT(index)}
                        disabled={isPending}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
                      >
                        {isPending ? '下架中...' : '下架'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-center bg-red-100 p-4 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 