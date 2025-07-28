/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-28 15:51:00
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-28 16:03:32
 * @FilePath: /web3-test-front/demo/src/work/client.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { createPublicClient, http } from 'viem'
import { sepolia, } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})