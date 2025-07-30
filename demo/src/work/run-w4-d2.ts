/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-07-30 19:45:00
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-07-30 19:45:00
 * @FilePath: /web3-test-front/demo/src/work/run-w4-d2.ts
 * @Description: 运行W4-D2-work.ts的测试脚本
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runW4D2Work() {
  try {
    console.log('开始运行W4-D2-work.ts脚本...\n');
    
    // 使用ts-node运行TypeScript文件
    const { stdout, stderr } = await execAsync('npx ts-node src/work/W4-D2-work.ts', {
      cwd: process.cwd(),
    });
    
    if (stdout) {
      console.log('输出结果:');
      console.log(stdout);
    }
    
    if (stderr) {
      console.error('错误信息:');
      console.error(stderr);
    }
    
  } catch (error) {
    console.error('运行脚本时出错:', error);
  }
}

// 运行脚本
runW4D2Work(); 