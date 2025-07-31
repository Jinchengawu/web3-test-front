/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-28 15:51:00
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-31 15:06:04
 * @FilePath: /web3-test-front/demo/src/work/private-client.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { createWalletClient, http, custom,  } from 'viem'
import { sepolia, } from 'viem/chains'
// import wallet from './Wallet'
import { privateKeyToAccount, Account } from "viem/accounts";

const PRIVATE_KEY = process.env.PRIVATE_KEY

// const wallet = new Wallet(PRIVATE_KEY)

const  account = privateKeyToAccount(PRIVATE_KEY as `0x${string}` )

export const privateClient = createWalletClient({  
  account,
  chain: sepolia,
  transport: http(process.env.QUICKNODE_ENDPOINT),
})