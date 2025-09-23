import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Layout as AntLayout } from 'antd';
import { 
  BulbOutlined, 
  ExperimentOutlined, 
  LineChartOutlined, 
  UnorderedListOutlined, 
  PlayCircleOutlined, 
  BarChartOutlined, 
  NodeIndexOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const { Sider, Content } = AntLayout;

// 获取应该高亮的菜单项 key
const getSelectedMenuKey = (pathname) => {
  // 评测集相关页面
  if (pathname.startsWith('/evaluation-gather')) {
    return '/evaluation-gather';
  }
  
  // 评估器相关页面
  if (pathname.startsWith('/evaluation-evaluator') || pathname === '/evaluation-debug') {
    return '/evaluation-evaluator';
  }
  
  // 实验相关页面
  if (pathname.startsWith('/evaluation-experiment')) {
    return '/evaluation-experiment';
  }
  
  // Prompt 相关页面
  if (pathname.startsWith('/prompt') || pathname === '/prompts' || pathname === '/playground' || pathname === '/version-history') {
    // 根据具体路径返回对应的菜单项
    if (pathname === '/playground') {
      return '/playground';
    }
    if (pathname === '/version-history') {
      return '/prompts'; // 版本历史页面归属于 Prompts 菜单
    }
    return '/prompts'; // 默认返回 Prompts 菜单
  }
  
  // Tracing 页面
  if (pathname.startsWith('/tracing')) {
    return '/tracing';
  }
  
  // 默认情况，直接返回当前路径
  return pathname;
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 获取应该高亮的菜单项 key
  const selectedKey = getSelectedMenuKey(location.pathname);

  const menuItems = [
    {
      key: 'prompt',
      label: 'Prompt工程',
      icon: <BulbOutlined />,
      children: [
        {
          key: '/prompts',
          label: 'Prompts',
          icon: <UnorderedListOutlined />
        },
        {
          key: '/playground',
          label: 'Playground',
          icon: <PlayCircleOutlined />
        }
      ]
    },
    {
      key: 'evaluation',
      label: '评测',
      icon: <ExperimentOutlined />,
      children: [
        {
          key: '/evaluation-gather',
          label: '评测集',
          icon: <UnorderedListOutlined />
        },
        {
          key: '/evaluation-evaluator',
          label: '评估器',
          icon: <BarChartOutlined />
        },
        {
          key: '/evaluation-experiment',
          label: '实验',
          icon: <ExperimentOutlined />
        }
      ]
    },
    {
      key: 'observability',
      label: '可观测',
      icon: <LineChartOutlined />,
      children: [
        {
          key: '/tracing',
          label: 'Tracing',
          icon: <NodeIndexOutlined />
        }
      ]
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <AntLayout className="h-screen">
      <Sider 
        width={256} 
        collapsedWidth={80}
        collapsed={collapsed}
        theme="light" 
        className="shadow-lg border-r border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 flex items-center whitespace-nowrap overflow-hidden">
            <SettingOutlined className="mr-1 text-blue-500" />
            {!collapsed && "SAA Admin"}
          </h1>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={collapsed ? [] : ['prompt', 'evaluation', 'observability']}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0 mt-6"
          inlineCollapsed={collapsed}
        />

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
          <div 
            className="flex items-center justify-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 
              <MenuUnfoldOutlined className="text-gray-600 text-lg" /> : 
              <MenuFoldOutlined className="text-gray-600 text-lg" />
            }
            {!collapsed && <span className="ml-2 text-gray-600">收起菜单</span>}
          </div>
        </div>
      </Sider>

      <Content className="overflow-hidden">
        <div className="h-full overflow-y-auto bg-gray-50">
          {children}
        </div>
      </Content>
    </AntLayout>
  );
};

export default Layout;