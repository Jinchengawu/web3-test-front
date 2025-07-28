import { keccak256, toHex } from 'viem'

// 方法1: 计算事件签名哈希
function calculateEventSignature(eventSignature: string): string {
  return keccak256(toHex(eventSignature))
}

// 方法2: 从哈希反推事件签名（需要预定义常见事件）
const commonEvents = [
  'Transfer(address,address,uint256)',
  'Transfer(address,address,uint256,uint256)',
  'Approval(address,address,uint256)',
  'ApprovalForAll(address,address,bool)',
  'Mint(address,uint256)',
  'Burn(address,uint256)',
  'Deposit(address,uint256)',
  'Withdraw(address,uint256)'
]

function findEventSignatureByHash(hash: string): string | null {
  for (const event of commonEvents) {
    if (calculateEventSignature(event) === hash) {
      return event
    }
  }
  return null
}

// 测试函数
async function main() {
  const targetHash = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  
  console.log('=== 事件签名计算和反推 ===')
  console.log('目标哈希:', targetHash)
  
  // 计算常见事件的哈希
  console.log('\n常见事件签名哈希:')
  for (const event of commonEvents) {
    const hash = calculateEventSignature(event)
    console.log(`${event} -> ${hash}`)
  }
  
  // 反推事件签名
  const foundEvent = findEventSignatureByHash(targetHash)
  if (foundEvent) {
    console.log(`\n✅ 找到匹配的事件: ${foundEvent}`)
  } else {
    console.log('\n❌ 在预定义事件中未找到匹配')
  }
  
  // 验证 Transfer 事件
  const transferEvent = 'Transfer(address,address,uint256)'
  const transferHash = calculateEventSignature(transferEvent)
  console.log(`\n验证 Transfer 事件:`)
  console.log(`事件: ${transferEvent}`)
  console.log(`哈希: ${transferHash}`)
  console.log(`匹配: ${transferHash === targetHash ? '✅ 是' : '❌ 否'}`)
}

main().catch(console.error) 