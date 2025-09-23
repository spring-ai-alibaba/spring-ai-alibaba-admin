# SAA Admin Frontend - AI Agent Development & Evaluation Platform

> Spring AI Alibaba Repo: https://github.com/alibaba/spring-ai-alibaba
>
> Spring AI Alibaba Website: https://java2ai.com
>
> Spring AI Alibaba Website Repo: https://github.com/springaialibaba/spring-ai-alibaba-website

English |  [中文](./README-zh.md)   

## 📋 Project Overview

SAA Admin Frontend is a modern frontend application built with React + TypeScript, providing a complete user interface for the AI Agent development and evaluation platform. The project integrates core functional modules including Prompt engineering, dataset management, evaluator configuration, and experiment execution.

## ⚡ Quick Start

### Environment Requirements
- **Node.js**: >= 16.0.0
- **pnpm**: >= 7.0.0 (Recommended)

### Install Dependencies
```bash
# Install dependencies
pnpm install
```

### Development Server
```bash
# Start development server
pnpm dev
```

Visit http://localhost:8080 to view the application.

### Production Build
```bash
# Build production version
pnpm build
```

After building, static files will be generated in the `dist` directory.

## 🔧 Configuration

### Backend API Configuration
Configure backend API address in `rspack.config.js`:

```javascript
devServer: {
  proxy: [
    {
      context: ["/api"],
      target: "http://127.0.0.1:8080", // Change to your backend address
      changeOrigin: true,
    }
  ]
}
```


## 📦 Deployment

### Static Deployment
```bash
# Build project
pnpm build
# Deploy to static server
# Upload dist directory contents to server
cp dist/* ../spring-ai-alibaba-admin-server/src/main/resources/static
```
 
 
## 🏗️ Project Architecture

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    SAA Admin Frontend                       │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Ant Design + Tailwind CSS          │
├─────────────────────────────────────────────────────────────┤
│  Rspack (Build Tool) + pnpm (Package Manager) + Router      │
├─────────────────────────────────────────────────────────────┤
│  Prompt Mgmt │ Dataset Mgmt │ Evaluator Mgmt │ Exp Mgmt     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Core Framework
- **React**: 18.2.0 - UI Library
- **TypeScript**: 5.9.2 - Type Safety
- **React Router DOM**: 6.8.0 - Routing

#### UI Component Library
- **Ant Design**: 5.27.1 - Enterprise UI Components
- **Ant Design Icons**: 6.0.0 - Icon Library
- **FontAwesome**: 6.4.0 - Font Icons

#### Build Tools
- **Rspack**: 1.4.11 - High-performance Build Tool
- **Tailwind CSS**: 3.3.5 - Atomic CSS Framework
- **PostCSS**: 8.4.31 - CSS Post-processor

#### Development Tools
- **Concurrently**: 9.2.0 - Concurrent Script Execution
- **Node Polyfill**: 4.1.0 - Node.js Compatibility

#### Feature Libraries
- **CodeMirror**: 6.0.2 - Code Editor
- **React JSON View**: 1.21.3 - JSON Visualization
- **Day.js**: 1.11.15 - Date Processing

## 📂 Project Structure

```
frontend/
├── server/
│   └── middleware/
│       ├── claude.js
│       └── router.js
├── src/
│   ├── components/        # Reusable Components
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
│   ├── pages/             # Page Components
│   │   ├── evaluation/    # Evaluation Module
│   │   │   ├── evaluator/     # Evaluator Management
│   │   │   ├── experiment/    # Experiment Management
│   │   │   └── gather/        # Dataset Management
│   │   ├── prompts/       # Prompt Management
│   │   │   ├── prompt-detail/ # Prompt Details
│   │   │   └── version-history/ # Version History
│   │   ├── playground/    # Debug Platform
│   │   └── tracing/       # Trace Management
│   ├── services/          # API Services
│   │   ├── evaluators/    # Evaluator API
│   │   ├── prompt/        # Prompt API
│   │   ├── model/         # Model API
│   │   └── tracing/       # Tracing API
│   ├── hooks/             # Custom Hooks
│   │   ├── useApiState.ts # API State Management
│   │   └── usePagination.ts # Pagination Management
│   ├── utils/             # Utility Functions
│   │   ├── request.ts     # Request Wrapper
│   │   ├── notification.ts # Notification Utils
│   │   └── util.ts        # Common Utils
│   ├── context/           # React Context
│   │   └── models.ts      # Model Context
│   └── styles/            # Style Files
│       ├── index.css      # Main Styles
│       └── tailwind.css   # Tailwind Styles
├── rspack.config.js       # Rspack Configuration
├── tailwind.config.js     # Tailwind Configuration
├── tsconfig.json          # TypeScript Configuration
└── package.json           # Project Configuration
```

## 🚀 Core Feature Modules

### 1. Prompt Management
- **Prompt Creation & Editing**: Rich text editing with code highlighting
- **Version Management**: Complete version history and comparison
- **Template System**: Pre-built and custom template management
- **Debugging Features**: Real-time debugging and streaming response support

### 2. Dataset Management
- **Dataset Creation**: Support for multiple data format imports
- **Data Item Management**: Batch operations and data validation
- **Version Control**: Dataset version management and rollback
- **Trace Integration**: Create datasets from trace data

### 3. Evaluator Management
- **Evaluator Configuration**: Visual configuration of evaluation logic
- **Template System**: Pre-built evaluator templates
- **Debugging Features**: Step-by-step debugging and result preview
- **Version Management**: Evaluator version control

### 4. Experiment Management
- **Experiment Creation**: Wizard-based experiment configuration
- **Batch Execution**: Support for large-scale batch testing
- **Real-time Monitoring**: Experiment progress and status monitoring
- **Result Analysis**: Detailed result statistics and visualization

### 5. Trace Management
- **Trace Viewing**: Complete request trace tracking
- **Performance Analysis**: Performance metrics and bottleneck analysis
- **Error Diagnosis**: Error localization and root cause analysis
