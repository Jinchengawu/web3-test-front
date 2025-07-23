/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-23 15:08:32
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-23 17:39:34
 * @FilePath: /web3-test-front/demo/src/viem2Eth-transfer.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */


/***
 * 
 * 
 * 编写一个脚本（可以基于 Viem.js 、Ethers.js 或其他的库来实现）来模拟一个命令行钱包，钱包包含的功能有：

生成私钥、查询余额（可人工转入金额）
构建一个 ERC20 转账的 EIP 1559 交易
用 1 生成的账号，对 ERC20 转账进行签名
发送交易到 Sepolia 网络。
 * 
 * 
 */
import axios from 'axios'
import { Address, Hex, encodeAbiParameters, createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 从环境变量中获取配置
const PRIVATE_KEY = process.env.PRIVATE_KEY
const MALL_ADDRESS = process.env.MALL_ADDRESS

// 检查环境变量是否存在
if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY environment variable is required')
}
if (!MALL_ADDRESS) {
  throw new Error('MALL_ADDRESS environment variable is required')
}

interface Transaction {
  form: Address // 交易的发送者
  to: Address // 交易的接收者
  nonce: Hex // 发送者的nonce
  type: Hex // 交易类型, 0(legcy) 或 1(EIP-2930) 或 2(EIP-1559)
  value: Hex // 交易携带的主币数量, 单位是 wei
  data: Hex // 交易携带的数据
  maxPriorityFeePerGas?: Hex // EIP-1559:每单位 gas 优先费用, type=2时提供
  maxFeePerGas?: Hex // EIP-1559:每单位 gas 最大费用, type=2时提供
  gas: Hex // 可使用的最大 gas 数量(gasLimit)
  gasPrice?: Hex // gas 价格, type!=2时提供
  accessList?: [] // EIP-2930新增属性, 值为包含地址和存储键的列表，主要为解决EIP-2929带来的副作用问题
}


console.log('MALL_ADDRESS',MALL_ADDRESS)
const RPC_URL = 'https://1rpc.io/sepolia'

class Wallet {
  privateKey: string
  address: Address
  account: any

  constructor(privateKey?: string) {
    // 如果没有提供私钥，则生成一个新的
    this.privateKey = privateKey || generatePrivateKey()
    // 从私钥生成账户
    this.account = privateKeyToAccount(this.privateKey as `0x${string}`)
    this.address = this.account.address
  }

  // 生成新的钱包
  static generateWallet(): Wallet {
    return new Wallet()
  }

  getPrivateKey(): string {
    return this.privateKey
  }

  getAddress(): Address {
    return this.address
  }

  // 获取账户信息
  getAccount() {
    return this.account
  }

  // 查询余额
  async getBalance(): Promise<string> {
    const params = {
      "jsonrpc": "2.0",
      "method": "eth_getBalance",
      "params": [this.address, "latest"],
      "id": 1
    }
    const { data } = await axios.post(RPC_URL, params)
    return data?.result || '0x0'
  }

  // 获取 nonce
  async getNonce(): Promise<string> {
    return await getNonce(this.address)
  }

  // 获取 gas 价格
  async getGasPrice(): Promise<string> {
    const params = {
      "jsonrpc": "2.0",
      "method": "eth_gasPrice",
      "params": [],
      "id": 2
    }
    const { data } = await axios.post(RPC_URL, params)
    return data?.result || '0x0'
  }

  // 创建 ERC20 转账交易
  createERC20TransferTransaction(
    to: Address, 
    tokenContract: Address, 
    amount: bigint
  ): Transaction {
    // ERC20 transfer 函数签名: transfer(address,uint256)
    const transferData = encodeAbiParameters(
      [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      [to, amount]
    )
    
    return {
      form: this.address,
      to: tokenContract,
      nonce: '0x0', // 需要从网络获取
      type: '0x2', // EIP-1559
      value: '0x0',
      data: `0xa9059cbb${transferData.slice(2)}`, // transfer 函数选择器 + 参数
      gas: '0x0', // 需要估算
      maxPriorityFeePerGas: '0x0', // 需要设置
      maxFeePerGas: '0x0' // 需要设置
    }
  }

  // 签名交易
  async signTransaction(transaction: Transaction): Promise<string> {
    const walletClient = createWalletClient({
      account: this.account,
      chain: sepolia,
      transport: http()
    })
    
    // 这里需要实现签名逻辑
    // 由于我们使用的是 axios 而不是 viem 的客户端，需要手动签名
    return '0x' // 占位符
  }

  // 发送交易
  async sendTransaction(transaction: Transaction): Promise<any> {
    return await sendTransaction(transaction)
  }
}



async function getNonce(address: Address) { 
  const params = {
    "jsonrpc": "2.0",
    "method": "eth_getTransactionCount",
    "params": [address, "latest"],
    "id": 6,    
  }
  const { data } = await axios.post(RPC_URL, params)
  const nonce = data?.result
  console.log('getNonce',data)
  return Promise.resolve(nonce)
}

function getGasPrice() {

}

function createTransaction(transaction: Transaction) {
  const _transaction = {
    ...transaction,
    data:'0xa9059cbb000000000000000000000000123456789012345678901234567890123456789000000000000000000000000000000000000000000000000000000000000f4240'
  }
  return transaction
}
// $ cast calldata "transfer(address,uint256)" 0x1234567890123456789012345678901234567890 1000000

// 0xa9059cbb000000000000000000000000123456789012345678901234567890123456789000000000000000000000000000000000000000000000000000000000000f4240

async function sendTransaction(transaction: Transaction) {
  const data = axios.post(RPC_URL, transaction)
  console.log('sendTransaction',data)
}
async function main() {
  console.log('=== ETH 钱包演示 ===')
  
  // 1. 生成新钱包
  console.log('\n1. 生成新钱包...')
  const newWallet = Wallet.generateWallet()
  console.log('新钱包地址:', newWallet.getAddress())
  console.log('新钱包私钥:', newWallet.getPrivateKey())
  
  // 2. 使用现有私钥创建钱包
  console.log('\n2. 使用现有私钥创建钱包...')
  if (PRIVATE_KEY) {
    const existingWallet = new Wallet(PRIVATE_KEY)
    console.log('现有钱包地址:', existingWallet.getAddress())
    console.log('现有钱包私钥:', existingWallet.getPrivateKey())
    
    // 3. 查询余额
    console.log('\n3. 查询余额...')
    const balance = await existingWallet.getBalance()
    console.log('钱包余额:', balance, 'wei')
    
    // 4. 获取 nonce
    console.log('\n4. 获取 nonce...')
    const nonce = await existingWallet.getNonce()
    console.log('当前 nonce:', nonce)
    
    // 5. 获取 gas 价格
    console.log('\n5. 获取 gas 价格...')
    const gasPrice = await existingWallet.getGasPrice()
    console.log('当前 gas 价格:', gasPrice, 'wei')
    
    // 6. 创建 ERC20 转账交易
    console.log('\n6. 创建 ERC20 转账交易...')
    const tokenContract = '0x1234567890123456789012345678901234567890' as Address // 示例代币合约地址
    const recipient = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address // 接收地址
    const amount = BigInt(1000000) // 转账数量
    
    const erc20Transaction = existingWallet.createERC20TransferTransaction(
      recipient,
      tokenContract,
      amount
    )
    console.log('ERC20 转账交易:', erc20Transaction)
    
    // 7. 演示完整的交易流程
    console.log('\n7. 演示完整的交易流程...')
    console.log('注意: 实际发送交易需要有效的私钥和足够的余额')
    console.log('当前演示仅展示交易构建过程')
  } else {
    console.log('未找到 PRIVATE_KEY 环境变量，跳过现有钱包操作')
  }
  
  console.log('\n=== 演示完成 ===')
}
main()