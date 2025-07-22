#!/bin/bash

# NFTMarket 部署脚本

echo "🚀 开始部署 NFTMarket 项目..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📝 下一步操作："
    echo "1. 配置 WalletConnect Project ID"
    echo "2. 部署智能合约"
    echo "3. 更新合约地址"
    echo "4. 启动生产服务器: npm start"
    echo ""
    echo "🌐 访问地址: http://localhost:3000"
else
    echo "❌ 构建失败！"
    exit 1
fi 