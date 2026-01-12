import React from 'react';
import { Card } from 'antd';
import { 
  BuildOutlined, 
  UploadOutlined, 
  CodeOutlined,
  ToolOutlined,
  ExperimentOutlined,
  GithubOutlined,
  ApartmentOutlined,
  LineChartOutlined,
  BarChartOutlined,
  BulbOutlined,
  DashboardOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.css';

interface CardData {
  title: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const ApplicationBuild = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleDisabledClick = (feature: string) => {
    console.log(`${feature} 功能尚未实现`);
  };

  // 创建智能体栏目
  const creationCards: CardData[] = [
    {
      title: '低代码平台开发智能体',
      description: '提供可视化的智能体开发、调试、部署、导出能力，支持聊天助手、工作流等模式。',
      icon: <BuildOutlined />,
      path: '/app',
    },
    {
      title: 'DIFY 应用转换为 SAA 工程',
      description: '将 Dify 平台上开发的智能体转换成 Spring AI Alibaba 应用，进而导入 IDE 开发维护。',
      icon: <UploadOutlined />,
      path: '/dify',
    },
    {
      title: '使用 Copilot 创建智能体',
      description: '通过 AI Copilot 助手智能引导，快速创建和配置智能体，提供自然语言交互的智能体开发体验',
      icon: <RobotOutlined />,
      disabled: true,
      onClick: () => handleDisabledClick('Copilot 创建智能体'),
    },
    {
      title: 'Agent Schema 方式创建智能体',
      description: '通过 Agent Schema 方式，快速创建和配置智能体',
      icon: <CodeOutlined />,
      path: '/agent-schema',
    },
    {
      title: '从 GitHub 导入智能体',
      description: '从 GitHub 仓库导入已有的智能体项目，支持多种项目结构和配置文件的自动识别。',
      icon: <GithubOutlined />,
      disabled: true,
      onClick: () => handleDisabledClick('GitHub 导入'),
    },
  ];

  // 调试智能体栏目
  const debugCards: CardData[] = [
    {
      title: 'Agent Chat UI',
      description: '兼容 AG-UI 规范的交互式的 UI 聊天界面，支持与智能体进行对话、和调试。',
      icon: <ToolOutlined />,
      path: '/debug',
    },
    {
      title: 'Graph 可视化调试',
      description: '可视化展示 Graph 工作流的执行过程，提供节点状态监控、数据流追踪等功能。',
      icon: <ApartmentOutlined />,
      disabled: true,
      onClick: () => handleDisabledClick('Graph 可视化调试'),
    },
  ];

  // 智能体管理栏目
  const managementCards: CardData[] = [
    {
      title: '智能体管理',
      description: '集中管理智能体生命周期，包括创建、配置、部署、监控和版本控制等功能',
      icon: <DashboardOutlined />,
      disabled: true,
      onClick: () => handleDisabledClick('智能体管理'),
    },
  ];

  const renderCard = (card: CardData) => {
    const isDisabled = card.disabled;
    return (
      <Card
        key={card.title}
        className={`feature-card ${isDisabled ? 'feature-card-disabled' : ''}`}
        hoverable={!isDisabled}
        bordered={false}
        onClick={() => {
          if (isDisabled && card.onClick) {
            card.onClick();
          } else if (card.path) {
            handleNavigate(card.path);
          }
        }}
      >
        <div className="feature-card-content">
          <div className="feature-icon-wrapper">
            <div className={`feature-icon ${isDisabled ? 'feature-icon-disabled' : ''}`}>
              {card.icon}
            </div>
          </div>
          <div className="feature-text">
            <h3 className="feature-title">{card.title}</h3>
            <p className="feature-description">{card.description}</p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="app-build-container">
      <div className="app-build-header">
        <h1 className="app-build-title">应用构建</h1>
        <p className="app-build-subtitle">
          统一汇聚多种应用创建方式，结合视觉化、转换与 Schema 方式，帮助团队快速将智能体梳理成标准的 SAA 工程。
        </p>
      </div>

      {/* 创建智能体 */}
      <div className="app-build-section">
        <h2 className="section-title">创建智能体</h2>
        <div className="app-build-grid">
          {creationCards.map(renderCard)}
        </div>
      </div>

      {/* 调试智能体 */}
      <div className="app-build-section">
        <h2 className="section-title">调试智能体</h2>
        <div className="app-build-grid">
          {debugCards.map(renderCard)}
        </div>
      </div>

      {/* 智能体管理 */}
      <div className="app-build-section">
        <h2 className="section-title">智能体管理</h2>
        <div className="app-build-grid">
          {managementCards.map(renderCard)}
        </div>
      </div>
    </div>
  );
};

export default ApplicationBuild;

