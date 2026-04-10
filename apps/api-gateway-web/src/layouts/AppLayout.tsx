import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  CloudServerOutlined,
  KeyOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/providers', icon: <CloudServerOutlined />, label: 'Providers' },
  { key: '/api-keys', icon: <KeyOutlined />, label: 'API Keys' },
  { key: '/logs', icon: <FileTextOutlined />, label: 'Logs' },
  { key: '/users', icon: <UserOutlined />, label: 'Users' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={60}>
        <div style={{ height: 32, margin: 16, color: '#fff', fontWeight: 600, fontSize: 16, textAlign: 'center', lineHeight: '32px' }}>
          API Gateway
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ position: 'absolute', bottom: 16, width: '100%', textAlign: 'center' }}>
          <LogoutOutlined
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: 18, cursor: 'pointer' }}
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
          />
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }} />
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
