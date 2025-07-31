/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-28 15:50:31
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-31 14:38:31
 * @FilePath: /web3-test-front/demo/src/work/W4-D1-ScanBlock.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import { publicClient } from './public-client.js'
import { parseAbiItem } from 'viem'


async function main() {
  // 获取最新的区块号
  const latestBlock = await publicClient.getBlockNumber()
  console.log('Latest block:', latestBlock)
  
  // 查询最近1000个区块的日志（符合RPC限制）
  const logs = await publicClient.getLogs({  
    address: '0xc1e3ec25d9edd46f69898a84ac02630798c0f4a5',
    // event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256)'),
    // args: {
    //   from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    //   to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
    // },
    fromBlock: 8815431n,
    toBlock: 8816140n
  })
  console.log('logs count:', logs.length)
  console.log('First few logs:', logs.slice(0, 3))
  
  // 准备保存的数据
  const dataToSave = {
    metadata: {
      timestamp: new Date().toISOString(),
      latestBlock: latestBlock.toString(),
      queryRange: {
        fromBlock: '8815431',
        toBlock: '8816140'
      },
      address: '0xc1e3ec25d9edd46f69898a84ac02630798c0f4a5',
      totalLogs: logs.length
    },
    logs: logs
  }
  
  // 保存到当前目录
  const fileName = `logs_${Date.now()}.json`
  await setFile(fileName, dataToSave)
  
  // 验证保存的数据
  const savedData = await readFile(fileName)
  if (savedData) {
    console.log(`验证: 成功读取保存的文件，包含 ${savedData.logs.length} 条日志`)
  }
}

import { writeFile, readFile as fsReadFile } from 'fs/promises'
import { join } from 'path'

// 自定义JSON序列化函数，处理BigInt
const customStringify = (obj: any): string => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  }, 2)
}

const setFile = async (path: string, data: any) => {
  try {
    await writeFile(path, customStringify(data), 'utf-8')
    console.log(`数据已保存到: ${path}`)
  } catch (error) {
    console.error('保存文件失败:', error)
  }
}

const readFile = async (path: string) => {
  try {
    const data = await fsReadFile(path, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取文件失败:', error)
    return null
  }
}

const frontAPI = async () => {
  return 
}

main()
