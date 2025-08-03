#!/usr/bin/env node

/*
 * @Author: dreamworks.cnn@gmail.com
 * @Date: 2025-08-03 21:35:00
 * @LastEditors: dreamworks.cnn@gmail.com
 * @LastEditTime: 2025-08-03 21:35:00
 * @FilePath: /web3-test-front/demo/src/work/run-delegate-demo.js
 * @Description: Delegate 合约演示运行脚本
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

const { execSync } = require('child_process');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);

// 帮助信息
function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              Delegate 合约演示运行脚本                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🚀 用法：                                                    ║
║    node run-delegate-demo.js [选项]                          ║
║                                                              ║
║  📋 可用选项：                                                ║
║                                                              ║
║  --demo                运行完整演示页面                       ║
║  --test                运行完整测试套件                       ║
║  --test=<module>       运行特定测试模块                       ║
║  --client              运行基础客户端测试                     ║
║  --help, -h            显示此帮助信息                         ║
║                                                              ║
║  🧪 测试模块：                                                ║
║    query               查询功能测试                           ║
║    permission          权限管理测试                           ║
║    deposit             授权和存款测试                         ║
║    multicall           批量调用测试                           ║
║    delegate            代理调用测试                           ║
║    emergency           紧急功能测试                           ║
║    integrated          综合功能测试                           ║
║                                                              ║
║  💡 示例：                                                    ║
║    node run-delegate-demo.js --demo                          ║
║    node run-delegate-demo.js --test                          ║
║    node run-delegate-demo.js --test=multicall                ║
║                                                              ║
║  ⚠️  注意事项：                                                ║
║    • 确保已安装所有依赖包                                     ║
║    • 配置正确的环境变量                                       ║
║    • 设置正确的合约地址                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
}

// 运行命令
function runCommand(command, description) {
  console.log(`\n🚀 ${description}...`);
  console.log(`📝 执行命令: ${command}\n`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..', '..')
    });
    console.log(`\n✅ ${description} 完成`);
  } catch (error) {
    console.error(`\n❌ ${description} 失败:`, error.message);
    process.exit(1);
  }
}

// 主函数
function main() {
  // 显示欢迎信息
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🎯 Delegate 合约演示启动器                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  欢迎使用 Delegate 合约演示系统！                             ║
║                                                              ║
║  📅 时间: ${new Date().toLocaleString()}                                 ║
║  📁 目录: ${process.cwd()}                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // 检查 TypeScript 和依赖
  console.log("🔍 检查环境...");
  
  try {
    execSync('npx tsc --version', { stdio: 'pipe' });
    console.log("✅ TypeScript 可用");
  } catch (error) {
    console.log("⚠️  TypeScript 不可用，将使用 ts-node");
  }

  // 处理命令行参数
  if (args.includes('--demo')) {
    // 运行演示页面
    runCommand(
      'npx ts-node demo/src/work/W4-D5-Delegate-Demo.ts',
      '运行 Delegate 合约演示页面'
    );
    
  } else if (args.includes('--test')) {
    // 运行完整测试
    runCommand(
      'npx ts-node demo/src/work/W4-D5-Delegate-Tests.ts',
      '运行完整测试套件'
    );
    
  } else if (args.some(arg => arg.startsWith('--test='))) {
    // 运行特定测试模块
    const testArg = args.find(arg => arg.startsWith('--test='));
    const testModule = testArg.split('=')[1];
    
    runCommand(
      `npx ts-node demo/src/work/W4-D5-Delegate-Tests.ts --test=${testModule}`,
      `运行 ${testModule} 测试模块`
    );
    
  } else if (args.includes('--client')) {
    // 运行基础客户端
    runCommand(
      'npx ts-node demo/src/work/W4-D5-Delegdate.ts',
      '运行基础客户端测试'
    );
    
  } else {
    console.log("❌ 未知的参数，请使用 --help 查看帮助信息");
    process.exit(1);
  }

  console.log(`
🎉 操作完成！

💡 提示：
   • 如需查看详细日志，请检查控制台输出
   • 遇到问题请查看 README 文档
   • 可使用 --help 查看更多选项

感谢使用 Delegate 合约演示系统！
  `);
}

// 执行主函数
main();