# SAA Admin Frontend - AI Agent 开发与评估平台

> Spring AI Alibaba Repo: https://github.com/alibaba/spring-ai-alibaba
>
> Spring AI Alibaba Website: https://java2ai.com
>
> Spring AI Alibaba Website Repo: https://github.com/springaialibaba/spring-ai-alibaba-website

[English](./README.md) | 中文

## 📋 项目概述

SAA Admin Frontend 是一个基于 React + TypeScript 构建的现代化前端应用，为 AI Agent 开发与评估平台提供完整的用户界面。项目集成了 Prompt 工程、数据集管理、评估器配置、实验执行等核心功能模块。

## ⚡ 快速开始

### 环境要求
- **Node.js**: >= 16.0.0
- **pnpm**: >= 7.0.0 (推荐)

### 安装依赖
```bash
# 安装依赖
pnpm install
```

### 开发服务器
```bash
# 启动开发服务器
pnpm dev
```

访问 http://localhost:8080 查看应用。

### 生产构建
```bash
# 构建生产版本
pnpm build
```

构建完成后，静态文件将生成在 `dist` 目录中。

## 🔧 配置

### 后端 API 配置
在 `rspack.config.js` 中配置后端 API 地址：

```javascript
devServer: {
  proxy: [
    {
      context: ["/api"],
      target: "http://127.0.0.1:8080", // 修改为您的后端地址
      changeOrigin: true,
    }
  ]
}
```

## 📦 部署

### 静态部署
```bash
# 构建项目
pnpm build
# 部署到静态服务器
# 将 dist 目录内容上传到服务器
cp dist/* ../spring-ai-alibaba-admin-server/src/main/resources/static
```

## 🏗️ 项目架构

### 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                    SAA Admin Frontend                       │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Ant Design + Tailwind CSS          │
├─────────────────────────────────────────────────────────────┤
│  Rspack (构建工具) + pnpm (包管理器) + Router                  |
├─────────────────────────────────────────────────────────────┤
│  Prompt 管理 │ 数据集管理 │ 评估器管理 │ 实验管理                │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

#### 核心框架
- **React**: 18.2.0 - UI 库
- **TypeScript**: 5.9.2 - 类型安全
- **React Router DOM**: 6.8.0 - 路由

#### UI 组件库
- **Ant Design**: 5.27.1 - 企业级 UI 组件
- **Ant Design Icons**: 6.0.0 - 图标库
- **FontAwesome**: 6.4.0 - 字体图标

#### 构建工具
- **Rspack**: 1.4.11 - 高性能构建工具
- **Tailwind CSS**: 3.3.5 - 原子化 CSS 框架
- **PostCSS**: 8.4.31 - CSS 后处理器

#### 开发工具
- **Concurrently**: 9.2.0 - 并发脚本执行
- **Node Polyfill**: 4.1.0 - Node.js 兼容性

#### 功能库
- **CodeMirror**: 6.0.2 - 代码编辑器
- **React JSON View**: 1.21.3 - JSON 可视化
- **Day.js**: 1.11.15 - 日期处理

## 📂 项目结构

```
frontend/
├── server/
│   └── middleware/
│       ├── claude.js
│       └── router.js
├── src/
│   ├── components/        # 可复用组件
│   │   ├── CreateEvaluatorModal.jsx
│   │   ├── CreatePromptModal.jsx
│   │   ├── DeleteConfirmModal.jsx
│   │   ├── ElementSelector.jsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── Layout.jsx
│   │   ├── PromptDetailModal.jsx
│   │   ├── PublishSuccessModal.jsx
│   │   ├── PublishVersionModal.jsx
│   │   ├── TemplateImportModal.jsx
│   │   ├── VersionCompareModal.jsx
│   │   └── VersionHistoryModal.jsx
│   ├── pages/             # 页面组件
│   │   ├── evaluation/    # 评估模块
│   │   │   ├── evaluator/     # 评估器管理
│   │   │   ├── experiment/    # 实验管理
│   │   │   └── gather/        # 数据集管理
│   │   ├── prompts/       # Prompt 管理
│   │   │   ├── prompt-detail/ # Prompt 详情
│   │   │   └── version-history/ # 版本历史
│   │   ├── playground/    # 调试平台
│   │   └── tracing/       # 链路管理
│   ├── services/          # API 服务
│   │   ├── evaluators/    # 评估器 API
│   │   ├── prompt/        # Prompt API
│   │   ├── model/         # 模型 API
│   │   └── tracing/       # 链路 API
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useApiState.ts # API 状态管理
│   │   └── usePagination.ts # 分页管理
│   ├── utils/             # 工具函数
│   │   ├── request.ts     # 请求封装
│   │   ├── notification.ts # 通知工具
│   │   └── util.ts        # 通用工具
│   ├── context/           # React Context
│   │   └── models.ts      # 模型上下文
│   └── styles/            # 样式文件
│       ├── index.css      # 主样式
│       └── tailwind.css   # Tailwind 样式
├── rspack.config.js       # Rspack 配置
├── tailwind.config.js     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目配置
```

## 🚀 核心功能模块

### 1. Prompt 管理
- **Prompt 创建与编辑**: 富文本编辑，支持代码高亮
- **版本管理**: 完整的版本历史和对比功能
- **模板系统**: 预置和自定义模板管理
- **调试功能**: 实时调试和流式响应支持

### 2. 数据集管理
- **数据集创建**: 支持多种数据格式导入
- **数据项管理**: 批量操作和数据验证
- **版本控制**: 数据集版本管理和回滚
- **链路集成**: 从链路数据创建数据集

### 3. 评估器管理
- **评估器配置**: 可视化配置评估逻辑
- **模板系统**: 预置评估器模板
- **调试功能**: 逐步调试和结果预览
- **版本管理**: 评估器版本控制

### 4. 实验管理
- **实验创建**: 向导式实验配置
- **批量执行**: 支持大规模批量测试
- **实时监控**: 实验进度和状态监控
- **结果分析**: 详细结果统计和可视化

### 5. 链路管理
- **链路查看**: 完整请求链路追踪
- **性能分析**: 性能指标和瓶颈分析
- **错误诊断**: 错误定位和根因分析
