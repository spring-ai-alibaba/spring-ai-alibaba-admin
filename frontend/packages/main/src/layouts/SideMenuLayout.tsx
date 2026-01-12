import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu } from 'antd';
import {
  AppstoreOutlined,
  BulbOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ToolOutlined,
  BuildOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import favicon from '../favicon.svg';
import $i18n from '@/i18n';
import Header from './Header';
import styles from './index.module.less';
import LangSelect from './LangSelect';
import LoginProvider from './LoginProvider';
import SettingDropdown from './SettingDropdown';
import ThemeSelect, { prefersColor } from './ThemeSelect';
import UserAccountModal from '@/components/UserAccountModal';
import PureLayout from './Pure';
import { ModelsContext } from '@/pages/admin/context/models';
import PromptAPI from '@/pages/admin/services';

const { Sider, Content } = AntLayout;

// 获取应该高亮的菜单项 key
const getSelectedMenuKey = (pathname: string): string => {
  // 应用构建相关页面
  if (pathname.startsWith('/build') || pathname === '/') {
    return '/build';
  }

  // 应用相关页面
  if (pathname.startsWith('/app')) {
    return '/app';
  }

  // MCP 相关页面
  if (pathname.startsWith('/mcp')) {
    return '/mcp';
  }

  // 组件相关页面
  if (pathname.startsWith('/component')) {
    return '/component';
  }

  // 知识库相关页面
  if (pathname.startsWith('/knowledge')) {
    return '/knowledge';
  }

  // 设置相关页面
  if (pathname.startsWith('/setting')) {
    return '/setting';
  }

  // 调试页面
  if (pathname.startsWith('/debug')) {
    return '/debug';
  }

  // Dify 转换页面
  if (pathname.startsWith('/dify')) {
    return '/dify';
  }

  // Agent Schema 页面
  if (pathname.startsWith('/agent-schema')) {
    return '/agent-schema';
  }

  // 评测集相关页面
  if (pathname.startsWith('/admin/evaluation/gather')) {
    return '/admin/evaluation/gather';
  }

  // 评估器相关页面
  if (pathname.startsWith('/admin/evaluation/evaluator') || pathname === '/admin/evaluation/debug') {
    return '/admin/evaluation/evaluator';
  }

  // 实验相关页面
  if (pathname.startsWith('/admin/evaluation/experiment')) {
    return '/admin/evaluation/experiment';
  }

  // Prompt 相关页面
  if (
    pathname.startsWith('/admin/prompt') ||
    pathname === '/admin/prompts' ||
    pathname === '/admin/playground' ||
    pathname === '/admin/version-history'
  ) {
    if (pathname === '/admin/playground') {
      return '/admin/playground';
    }
    return '/admin/prompts';
  }

  // Tracing 页面
  if (pathname.startsWith('/admin/tracing')) {
    return '/admin/tracing';
  }

  // 默认情况，直接返回当前路径
  return pathname;
};

export default function SideMenuLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [modelNameMap, setModelNameMap] = useState<Record<number, string>>({});
  const [isDarkMode, setIsDarkMode] = useState(prefersColor.get() === 'dark');

  // 加载模型列表（用于 admin 页面）
  useEffect(() => {
    PromptAPI.getModels({})
      .then((res) => {
        const nameMap = res.data.pageItems.reduce((acc: Record<number, string>, item: any) => {
          acc[item.id] = item.name;
          return acc;
        }, {});
        setModelNameMap(nameMap);
        setModels(res.data.pageItems);
      })
      .catch((err) => {
        console.error('Failed to load models:', err);
      });
  }, []);

  // 监听主题变化
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(prefersColor.get() === 'dark');
    };
    window.addEventListener('storage', handleStorageChange);
    // 由于主题切换会 reload，这里主要是为了初始化
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 获取应该高亮的菜单项 key
  const selectedKey = useMemo(() => getSelectedMenuKey(location.pathname), [location.pathname]);

  // 构建菜单项
  const menuItems = useMemo(
    () => [
      {
        key: 'studio',
        label: $i18n.get({
          id: 'main.layouts.SideMenu.studio',
          dm: ' Agent Builder',
        }),
        icon: <AppstoreOutlined />,
        children: [
          {
            key: '/build',
            label: '应用构建',
            icon: <BuildOutlined />,
          },
          {
            key: '/app',
            label: '应用管理',
            icon: <AppstoreOutlined />,
          },
          {
            key: '/mcp',
            label: 'MCP',
            icon: <ApiOutlined />,
          },
          {
            key: '/component',
            label: $i18n.get({
              id: 'main.pages.Component.AppComponent.index.component',
              dm: '组件',
            }),
            icon: <ToolOutlined />,
          },
          {
            key: '/knowledge',
            label: $i18n.get({
              id: 'main.pages.Knowledge.Test.index.knowledgeBase',
              dm: '知识库',
            }),
            icon: <DatabaseOutlined />,
          },
          {
            key: '/dify',
            label: $i18n.get({
              id: 'main.layouts.SideMenu.dify',
              dm: 'Dify To Graph',
            }),
            icon: <SwapOutlined />,
          },
        ],
      },
      {
        key: 'prompt',
        label: 'Prompt工程',
        icon: <BulbOutlined />,
        children: [
          {
            key: '/admin/prompts',
            label: 'Prompts',
            icon: <UnorderedListOutlined />,
          },
          {
            key: '/admin/playground',
            label: 'Playground',
            icon: <PlayCircleOutlined />,
          },
        ],
      },
      {
        key: 'evaluation',
        label: '评测',
        icon: <ExperimentOutlined />,
        children: [
          {
            key: '/admin/evaluation/gather',
            label: '评测集',
            icon: <UnorderedListOutlined />,
          },
          {
            key: '/admin/evaluation/evaluator',
            label: '评估器',
            icon: <BarChartOutlined />,
          },
          {
            key: '/admin/evaluation/experiment',
            label: '实验',
            icon: <ExperimentOutlined />,
          },
        ],
      },
      {
        key: 'observability',
        label: '可观测',
        icon: <LineChartOutlined />,
        children: [
          {
            key: '/admin/tracing',
            label: 'Tracing',
            icon: <NodeIndexOutlined />,
          },
        ],
      },
      {
        key: '/setting',
        label: $i18n.get({
          id: 'main.pages.Setting.ModelService.Detail.setting',
          dm: '设置',
        }),
        icon: <SettingOutlined />,
      },
    ],
    [],
  );

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 判断是否应该隐藏侧边栏（登录页等）
  const shouldHideSidebar = ['/login'].includes(location.pathname);

  if (shouldHideSidebar) {
    return (
      <PureLayout>
        <LoginProvider>
          <Header
            right={
              <>
                <ThemeSelect />
                <LangSelect />
                <SettingDropdown />
                <UserAccountModal avatarProps={{ className: styles.avatar }} />
              </>
            }
          />
          <div className={styles['body']}>{children}</div>
        </LoginProvider>
      </PureLayout>
    );
  }

  return (
    <PureLayout>
      <LoginProvider>
        <ModelsContext.Provider
          value={{
            models,
            modelNameMap,
            setModels,
          }}
        >
          <AntLayout className="h-screen">
            <Sider
              width={256}
              collapsedWidth={80}
              collapsed={collapsed}
              theme={isDarkMode ? 'dark' : 'light'}
              className="shadow-lg"
              style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                borderRight: `1px solid var(--ag-ant-color-border-secondary, ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'})`,
                backgroundColor: isDarkMode ? 'var(--ag-ant-color-bg-container, #141414)' : 'var(--ag-ant-color-bg-container, #ffffff)',
              }}
            >
              <div
                style={{
                  padding: '24px',
                  borderBottom: `1px solid var(--ag-ant-color-border-secondary, ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'})`,
                }}
              >
                <h1
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: isDarkMode ? 'var(--ag-ant-color-text-base, #ffffff)' : 'var(--ag-ant-color-text-base, #262626)',
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    margin: 0,
                  }}
                >
                  <img src={favicon} alt="SAA Admin" style={{ marginRight: '4px', width: '20px', height: '20px' }} />
                  {!collapsed && 'SAA Admin'}
                </h1>
              </div>

              <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                defaultOpenKeys={collapsed ? [] : ['studio']}
                items={menuItems}
                onClick={handleMenuClick}
                className="border-r-0 mt-6"
                inlineCollapsed={collapsed}
                theme={isDarkMode ? 'dark' : 'light'}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderTop: `1px solid var(--ag-ant-color-border-secondary, ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'})`,
                  backgroundColor: isDarkMode ? 'var(--ag-ant-color-bg-container, #141414)' : 'var(--ag-ant-color-bg-container, #ffffff)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? (
                    <MenuUnfoldOutlined
                      style={{
                        color: isDarkMode ? 'var(--ag-ant-color-text-secondary, rgba(255, 255, 255, 0.65))' : 'var(--ag-ant-color-text-secondary, rgba(0, 0, 0, 0.65))',
                        fontSize: '18px',
                      }}
                    />
                  ) : (
                    <MenuFoldOutlined
                      style={{
                        color: isDarkMode ? 'var(--ag-ant-color-text-secondary, rgba(255, 255, 255, 0.65))' : 'var(--ag-ant-color-text-secondary, rgba(0, 0, 0, 0.65))',
                        fontSize: '18px',
                      }}
                    />
                  )}
                  {!collapsed && (
                    <span
                      style={{
                        marginLeft: '8px',
                        color: isDarkMode ? 'var(--ag-ant-color-text-secondary, rgba(255, 255, 255, 0.65))' : 'var(--ag-ant-color-text-secondary, rgba(0, 0, 0, 0.65))',
                      }}
                    >
                      收起菜单
                    </span>
                  )}
                </div>
              </div>
            </Sider>

            <AntLayout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.2s' }}>
              <Header
                right={
                  <>
                    <ThemeSelect />
                    <LangSelect />
                    <SettingDropdown />
                    <UserAccountModal avatarProps={{ className: styles.avatar }} />
                  </>
                }
              />
              <Content className="overflow-hidden">
                <div className="h-full overflow-y-auto bg-gray-50" style={{ minHeight: 'calc(100vh - 56px)' }}>
                  {children}
                </div>
              </Content>
            </AntLayout>
          </AntLayout>
        </ModelsContext.Provider>
      </LoginProvider>
    </PureLayout>
  );
}

