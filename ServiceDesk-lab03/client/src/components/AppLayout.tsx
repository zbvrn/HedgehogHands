import { Layout, Menu, Button, Typography, Space, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const studentMenuItems = [
  { key: '/tickets', label: <Link to="/tickets">My Tickets</Link> },
  { key: '/tickets/new', label: <Link to="/tickets/new">New Ticket</Link> },
];

const operatorMenuItems = [
  { key: '/queue/new', label: <Link to="/queue/new">New</Link> },
  { key: '/queue/assigned', label: <Link to="/queue/assigned">Assigned to Me</Link> },
  { key: '/queue/resolved', label: <Link to="/queue/resolved">Resolved</Link> },
];

const adminMenuItems = [
  { key: '/admin/categories', label: <Link to="/admin/categories">Categories</Link> },
  { key: '/admin/users', label: <Link to="/admin/users">Users</Link> },
];

export default function AppLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems =
    role === 'Student'
      ? studentMenuItems
      : role === 'Operator'
        ? operatorMenuItems
        : role === 'Admin'
          ? adminMenuItems
          : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
          Service Desk
        </Typography.Title>
        <Space>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            {user?.displayName ?? 'Guest'} · {role}
          </Typography.Text>
          <Button type="link" style={{ color: 'white', padding: 0 }} onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </Header>

      <Layout>
        <Sider width={220} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: colorBgContainer,
              borderRadius: 8,
              padding: 24,
              minHeight: 360,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
