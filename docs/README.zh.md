# 电子书转PDF转换器
[English](README.md) | [한국어](docs/README.ko.md) | [日本語](docs/README.ja.md)

从电子书阅读器自动捕获页面并转换为PDF的桌面应用程序。

## 主要功能
- 自动屏幕区域捕获
- 自动翻页
- PDF转换
- 可调节捕获速度
- 实时进度显示
- 多平台支持（macOS、Windows）

## 技术栈
- Electron
- React
- TypeScript
- Sharp（图像处理）
- PDFKit（PDF生成）

## 安装
```bash
npm install
```

## 开发模式运行
```bash
npm run dev
```

在另一个终端中.
```bash
npm start
```

## 构建

### macOS & Windows 同时构建
```bash
npm run package
```

### 仅构建 macOS
```bash
npm run package:mac
```

### 仅构建 Windows
```bash
npm run package:win
```

构建文件将在 `release` 文件夹中生成。

## 使用方法
1. 打开电子书阅读器并导航到第一页
2. 点击设置捕获区域的左上角坐标
3. 点击设置捕获区域的右下角坐标
4. 输入总页数
5. 输入PDF文件名
6. 调整捕获速度（默认：1000毫秒）
7. 点击"创建PDF"按钮

## 使用注意事项
- 电子书阅读器必须支持使用右箭头键进行页面导航
- 捕获区域不得超出阅读器边界
- 大量页数可能需要相当长的时间
- 捕获期间请勿执行其他任务
- 仅供个人使用

## 系统要求

### macOS
- macOS 10.14 或更高版本
- 需要屏幕录制权限

### Windows
- Windows 10 或更高版本
- PowerShell 5.0 或更高版本

## 法律声明
本程序仅供个人学习和使用。
共享或商业使用生成的PDF文件可能违反版权法。
所有责任由用户承担。

## 许可证
Apache License 2.0

## 作者
Created by efforthye

## 贡献
欢迎贡献！请随时提交Pull Request。
